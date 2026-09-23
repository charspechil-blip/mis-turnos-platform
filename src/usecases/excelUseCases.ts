import * as XLSX from 'xlsx';
import { repository } from '../data/storage.ts';
import {
  Turno,
  Empleado,
  Asignacion,
  HistorialEvento,
} from '../domain/types.ts';
import { obtenerMatrizCuadrante } from './planificacionUseCases.ts';

export interface ImportFila {
  filaNumero: number;
  empleadoId: string;
  empleadoNombre: string;
  identificacionInterna: string;
  fecha: string; // YYYY-MM-DD
  turnoId: string;
  turnoCodigo: string;
  notas?: string;
  tieneConflicto: boolean;
  conflictoTipo?: 'MODIFICACION_AUTORIZADA' | 'EXCEPCION';
  conflictoDetalle?: string;
}

export interface FilaError {
  filaNumero: number;
  error: string;
  datosCrudos: Record<string, any>;
}

export interface ResultadoValidacionImportacion {
  esValido: boolean;
  totalFilas: number;
  filasAceptadas: ImportFila[];
  filasConError: FilaError[];
  conflictos: ImportFila[];
}

/**
 * Genera y descarga un archivo Excel (.xlsx) con el cuadrante oficial de la empresa.
 */
export function exportarCuadranteExcel(
  empresaId: string,
  fechaInicioStr: string,
  fechaFinStr: string
): void {
  const db = repository.getState();
  const empresa = db.empresas.find((e) => e.id === empresaId);
  const cuadrante = obtenerMatrizCuadrante(empresaId, fechaInicioStr, fechaFinStr);

  const wb = XLSX.utils.book_new();

  // 1. Hoja Cuadrante Oficial
  const headers = ['Legajo', 'Empleado', 'Modalidad', 'Grupo'];
  for (const f of cuadrante.fechas) {
    // Formato legible DD/MM
    const parts = f.split('-');
    headers.push(`${parts[2]}/${parts[1]}`);
  }
  headers.push('Horas Totales', 'Días Trabajo', 'Días Libres');

  const rows: any[][] = [headers];

  for (const emp of cuadrante.empleados) {
    const grupo = emp.grupoId ? cuadrante.gruposMap[emp.grupoId]?.nombre || 'Sin Grupo' : 'Sin Grupo';
    const rowData: any[] = [
      emp.identificacionInterna,
      `${emp.nombre} ${emp.apellidos}`,
      emp.modalidadTrabajo,
      grupo,
    ];

    let totalHoras = 0;
    let diasTrabajo = 0;
    let diasLibre = 0;

    for (const f of cuadrante.fechas) {
      const celda = cuadrante.grilla[emp.id]?.[f];
      const turno = celda?.turnoOficial;
      if (turno) {
        // Añadimos indicador de origen si fue autorizado (*)
        const sufijo = celda.origenOficial === 'MODIFICACION_AUTORIZADA' ? '*' : '';
        rowData.push(`${turno.codigo}${sufijo}`);

        totalHoras += turno.horasComputables || 0;
        if (turno.esLibre) diasLibre++;
        else diasTrabajo++;
      } else {
        rowData.push('-');
      }
    }

    rowData.push(totalHoras, diasTrabajo, diasLibre);
    rows.push(rowData);
  }

  const wsCuadrante = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsCuadrante, 'Cuadrante Oficial');

  // 2. Hoja Catálogo de Turnos
  const turnosEmpresa = db.turnos.filter((t) => t.empresaId === empresaId);
  const turnosRows = [
    ['Código', 'Nombre Turno', 'Horas Computables', 'Horario', 'Es Descanso'],
    ...turnosEmpresa.map((t) => [
      t.codigo,
      t.nombre,
      t.horasComputables,
      t.horaInicio ? `${t.horaInicio} - ${t.horaFin}` : 'No aplica',
      t.esLibre ? 'Sí' : 'No',
    ]),
  ];
  const wsTurnos = XLSX.utils.aoa_to_sheet(turnosRows);
  XLSX.utils.book_append_sheet(wb, wsTurnos, 'Catálogo Turnos');

  // 3. Hoja Plantilla de Importación
  const plantillaHeaders = ['Identificador_Empleado', 'Nombre_Referencia', 'Fecha (YYYY-MM-DD)', 'Codigo_Turno', 'Notas'];
  const plantillaEjemplos = [
    ['LEG-1001', 'Carlos Vega', fechaInicioStr, 'T1', 'Planificación especial'],
    ['LEG-1002', 'Pedro Morales', fechaInicioStr, 'T2', 'Guardia'],
    ['LEG-2001', 'Ana Beltrán', fechaInicioStr, 'LIB', 'Descanso compensatorio'],
  ];
  const wsPlantilla = XLSX.utils.aoa_to_sheet([plantillaHeaders, ...plantillaEjemplos]);
  XLSX.utils.book_append_sheet(wb, wsPlantilla, 'Plantilla Importación');

  // Descargar en navegador
  const fileName = `MIS_TURNOS_${(empresa?.nombre || 'Empresa').replace(/\s+/g, '_')}_${fechaInicioStr}_al_${fechaFinStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Valida un archivo Excel antes de aplicar la importación.
 * Identifica errores de formato, empleados inexistentes, turnos inválidos
 * y detecta conflictos con MODIFICACIONES AUTORIZADAS existentes.
 */
export function validarArchivoExcel(
  fileBuffer: ArrayBuffer,
  empresaId: string
): ResultadoValidacionImportacion {
  const db = repository.getState();
  const empleadosEmpresa = db.empleados.filter((e) => e.empresaId === empresaId);
  const turnosEmpresa = db.turnos.filter((t) => t.empresaId === empresaId);
  const asignacionesEmpresa = db.asignaciones.filter((a) => a.empresaId === empresaId);
  const excepcionesEmpresa = db.excepciones.filter((e) => e.empresaId === empresaId && e.estado === 'ACTIVA');

  const turnosByCode = new Map<string, Turno>();
  turnosEmpresa.forEach((t) => turnosByCode.set(t.codigo.toUpperCase().trim(), t));

  const empByIdent = new Map<string, Empleado>();
  const empByName = new Map<string, Empleado>();
  empleadosEmpresa.forEach((e) => {
    empByIdent.set(e.identificacionInterna.toUpperCase().trim(), e);
    const fullName = `${e.nombre} ${e.apellidos}`.toLowerCase().trim();
    empByName.set(fullName, e);
  });

  const wb = XLSX.read(fileBuffer, { type: 'array' });
  // Usar la primera hoja o la que contenga "Plantilla" o "Import"
  let sheetName = wb.SheetNames[0];
  const targetSheet = wb.SheetNames.find(
    (name) => name.toLowerCase().includes('plantilla') || name.toLowerCase().includes('import')
  );
  if (targetSheet) {
    sheetName = targetSheet;
  }

  const ws = wb.Sheets[sheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

  const filasAceptadas: ImportFila[] = [];
  const filasConError: FilaError[] = [];
  const conflictos: ImportFila[] = [];

  rawRows.forEach((row, index) => {
    const filaNumero = index + 2; // Considerando fila 1 cabecera

    // Normalizar nombres de columnas comunes
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[]) => {
      for (const k of keys) {
        if (possibleKeys.some((p) => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p))) {
          return String(row[k]).trim();
        }
      }
      return '';
    };

    const identificador = getVal(['identificador', 'legajo', 'dni', 'codigoempleado', 'id']);
    const nombreRef = getVal(['nombre', 'empleado']);
    let fechaRaw = getVal(['fecha', 'date', 'dia']);
    const codigoTurno = getVal(['turno', 'codigoturno', 'codigo']).toUpperCase();
    const notas = getVal(['notas', 'observaciones', 'motivo']);

    // Validar Empleado
    let emp: Empleado | undefined = undefined;
    if (identificador) {
      emp = empByIdent.get(identificador.toUpperCase());
    }
    if (!emp && nombreRef) {
      emp = empByName.get(nombreRef.toLowerCase());
    }

    if (!emp) {
      filasConError.push({
        filaNumero,
        error: `Empleado no identificado (identificador: "${identificador}", nombre: "${nombreRef}")`,
        datosCrudos: row,
      });
      return;
    }

    // Normalizar Fecha
    let fechaISO = '';
    if (fechaRaw) {
      // Manejar formato fecha de Excel (número de serie o string)
      if (/^\d{4}-\d{2}-\d{2}$/.test(fechaRaw)) {
        fechaISO = fechaRaw;
      } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaRaw)) {
        const parts = fechaRaw.split('/');
        fechaISO = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else if (!isNaN(Number(fechaRaw)) && Number(fechaRaw) > 20000) {
        // Serial de Excel
        const excelDate = new Date(Math.round((Number(fechaRaw) - 25569) * 86400 * 1000));
        fechaISO = excelDate.toISOString().slice(0, 10);
      }
    }

    if (!fechaISO || !/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
      filasConError.push({
        filaNumero,
        error: `Fecha no válida ("${fechaRaw}"). Se requiere formato YYYY-MM-DD`,
        datosCrudos: row,
      });
      return;
    }

    // Validar Turno
    const turno = turnosByCode.get(codigoTurno);
    if (!turno) {
      filasConError.push({
        filaNumero,
        error: `Código de turno desconocido: "${codigoTurno}". Verifique el catálogo de turnos.`,
        datosCrudos: row,
      });
      return;
    }

    // Detección de Conflictos con Modificaciones Autorizadas o Excepciones
    const asgExistente = asignacionesEmpresa.find(
      (a) => a.empleadoId === emp!.id && a.fecha === fechaISO
    );
    const excepcionExistente = excepcionesEmpresa.find(
      (e) => e.empleadoId === emp!.id && e.fechaInicio <= fechaISO && fechaISO <= e.fechaFin
    );

    let tieneConflicto = false;
    let conflictoTipo: 'MODIFICACION_AUTORIZADA' | 'EXCEPCION' | undefined;
    let conflictoDetalle: string | undefined;

    if (asgExistente && asgExistente.origen === 'MODIFICACION_AUTORIZADA') {
      tieneConflicto = true;
      conflictoTipo = 'MODIFICACION_AUTORIZADA';
      const turnoPrevio = turnosEmpresa.find((t) => t.id === asgExistente.turnoId);
      conflictoDetalle = `Existe una MODIFICACIÓN AUTORIZADA previa (Turno ${turnoPrevio?.codigo || 'Oficial'}). Si se importa, se preservará a menos que elija sobrescribir.`;
    } else if (excepcionExistente) {
      tieneConflicto = true;
      conflictoTipo = 'EXCEPCION';
      conflictoDetalle = `El empleado se encuentra en ${excepcionExistente.tipo} (${excepcionExistente.motivo}).`;
    }

    const item: ImportFila = {
      filaNumero,
      empleadoId: emp.id,
      empleadoNombre: `${emp.nombre} ${emp.apellidos}`,
      identificacionInterna: emp.identificacionInterna,
      fecha: fechaISO,
      turnoId: turno.id,
      turnoCodigo: turno.codigo,
      notas: notas || undefined,
      tieneConflicto,
      conflictoTipo,
      conflictoDetalle,
    };

    filasAceptadas.push(item);
    if (tieneConflicto) {
      conflictos.push(item);
    }
  });

  return {
    esValido: filasConError.length === 0 && filasAceptadas.length > 0,
    totalFilas: rawRows.length,
    filasAceptadas,
    filasConError,
    conflictos,
  };
}

/**
 * Aplica las filas validadas a la base de datos de la empresa.
 * Por defecto protege y no destruye modificaciones autorizadas existentes.
 */
export function aplicarImportacionExcel(
  empresaId: string,
  filas: ImportFila[],
  opciones: {
    sobrescribirModificacionesAutorizadas: boolean;
    usuarioNombre: string;
  }
): { aplicadas: number; omitidasPorProteccion: number } {
  const db = repository.getState();
  let aplicadas = 0;
  let omitidasPorProteccion = 0;

  for (const fila of filas) {
    // Verificar si existe asignación previa
    const idx = db.asignaciones.findIndex(
      (a) => a.empresaId === empresaId && a.empleadoId === fila.empleadoId && a.fecha === fila.fecha
    );

    if (idx >= 0) {
      const existente = db.asignaciones[idx];
      if (
        existente.origen === 'MODIFICACION_AUTORIZADA' &&
        !opciones.sobrescribirModificacionesAutorizadas
      ) {
        // Protección activa: no se sobreescribe
        omitidasPorProteccion++;
        continue;
      }

      // Actualizar a origen IMPORTACION
      db.asignaciones[idx] = {
        ...existente,
        turnoId: fila.turnoId,
        origen: 'IMPORTACION',
        notas: fila.notas ? `Importación Excel: ${fila.notas}` : 'Importado mediante Excel',
        fechaModificacion: new Date().toISOString(),
      };
      aplicadas++;
    } else {
      // Crear nueva asignación con origen IMPORTACION
      const nuevaAsg: Asignacion = {
        id: `asg-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        empresaId,
        empleadoId: fila.empleadoId,
        fecha: fila.fecha,
        turnoId: fila.turnoId,
        origen: 'IMPORTACION',
        notas: fila.notas ? `Importación Excel: ${fila.notas}` : 'Importado mediante Excel',
        fechaModificacion: new Date().toISOString(),
      };
      db.asignaciones.push(nuevaAsg);
      aplicadas++;
    }
  }

  // Registrar en historial
  const evento: HistorialEvento = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId,
    tipoEvento: 'IMPORTACION_EXCEL',
    motivo: `Importación masiva completada: ${aplicadas} asignaciones aplicadas, ${omitidasPorProteccion} protegidas contra sobrescritura`,
    usuarioNombre: opciones.usuarioNombre,
    timestamp: new Date().toISOString(),
  };

  db.historial.unshift(evento);
  repository.saveState(db);

  return { aplicadas, omitidasPorProteccion };
}
