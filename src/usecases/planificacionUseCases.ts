import { repository } from '../data/storage.ts';
import {
  TurnoOficialDia,
  Empleado,
  Turno,
  Grupo,
  Asignacion,
  HistorialEvento,
} from '../domain/types.ts';
import {
  resolveOfficialScheduleForDay,
  ResolverContext,
} from '../domain/rules/officialScheduleResolver.ts';
import { formatDateOnly, parseDateOnly } from '../domain/rules/rotationCalculator.ts';

export interface CuadranteResultado {
  fechas: string[]; // Fechas YYYY-MM-DD
  empleados: Empleado[];
  turnosMap: Record<string, Turno>;
  gruposMap: Record<string, Grupo>;
  // Matriz de resultados oficiales: [empleadoId][fecha] => TurnoOficialDia
  grilla: Record<string, Record<string, TurnoOficialDia>>;
}

/**
 * Obtiene la matriz completa del cuadrante para un rango de fechas en una empresa.
 */
export function obtenerMatrizCuadrante(
  empresaId: string,
  fechaInicioStr: string,
  fechaFinStr: string,
  filtroGrupoId?: string
): CuadranteResultado {
  const db = repository.getState();

  // Filtrar entidades de la empresa
  const turnosEmpresa = db.turnos.filter((t) => t.empresaId === empresaId);
  const gruposEmpresa = db.grupos.filter((g) => g.empresaId === empresaId);
  const reglasEmpresa = db.reglasRotacion.filter((r) => r.empresaId === empresaId);
  let empleadosEmpresa = db.empleados.filter(
    (e) => e.empresaId === empresaId && e.estado === 'ACTIVO'
  );

  if (filtroGrupoId) {
    empleadosEmpresa = empleadosEmpresa.filter((e) => e.grupoId === filtroGrupoId);
  }

  const turnosMap: Record<string, Turno> = {};
  turnosEmpresa.forEach((t) => {
    turnosMap[t.id] = t;
  });

  const gruposMap: Record<string, Grupo> = {};
  gruposEmpresa.forEach((g) => {
    gruposMap[g.id] = g;
  });

  const reglasMap: Record<string, any> = {};
  reglasEmpresa.forEach((r) => {
    reglasMap[r.id] = r;
  });

  const autorizacionesMap: Record<string, any> = {};
  db.autorizaciones
    .filter((a) => a.empresaId === empresaId)
    .forEach((a) => {
      autorizacionesMap[a.id] = a;
    });

  // Turno libre por defecto (o crear uno virtual si no existe)
  const turnoLibre = turnosEmpresa.find((t) => t.esLibre) || {
    id: 'trn-libre-fallback',
    empresaId,
    codigo: 'LIB',
    nombre: 'Descanso / Libre',
    esLibre: true,
    horasComputables: 0,
    colorHex: '#64748b',
  };

  const context: ResolverContext = {
    turnosMap,
    gruposMap,
    reglasMap,
    turnoLibrePorDefecto: turnoLibre,
    asignaciones: db.asignaciones.filter((a) => a.empresaId === empresaId),
    excepciones: db.excepciones.filter((e) => e.empresaId === empresaId),
    solicitudes: db.solicitudes.filter((s) => s.empresaId === empresaId),
    autorizacionesMap,
  };

  // Generar lista de fechas del rango
  const fechas: string[] = [];
  const start = parseDateOnly(fechaInicioStr);
  const end = parseDateOnly(fechaFinStr);

  const current = new Date(start.getTime());
  while (current <= end) {
    fechas.push(formatDateOnly(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Construir grilla
  const grilla: Record<string, Record<string, TurnoOficialDia>> = {};
  for (const emp of empleadosEmpresa) {
    grilla[emp.id] = {};
    for (const f of fechas) {
      grilla[emp.id][f] = resolveOfficialScheduleForDay(emp, f, context);
    }
  }

  return {
    fechas,
    empleados: empleadosEmpresa,
    turnosMap,
    gruposMap,
    grilla,
  };
}

/**
 * Asigna manualmente un turno a un empleado para una fecha determinada.
 */
export function asignarTurnoManual(
  empresaId: string,
  empleadoId: string,
  fecha: string,
  turnoId: string,
  usuarioNombre: string = 'Gestor de Turnos',
  notas?: string
): void {
  const db = repository.getState();
  const emp = db.empleados.find((e) => e.id === empleadoId);
  const turno = db.turnos.find((t) => t.id === turnoId);

  // Buscar asignación existente
  const idx = db.asignaciones.findIndex(
    (a) => a.empresaId === empresaId && a.empleadoId === empleadoId && a.fecha === fecha
  );

  const prevAsignacion = idx >= 0 ? db.asignaciones[idx] : null;
  const prevTurno = prevAsignacion ? db.turnos.find((t) => t.id === prevAsignacion.turnoId) : null;

  const nuevaAsignacion: Asignacion = {
    id: prevAsignacion ? prevAsignacion.id : `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId,
    empleadoId,
    fecha,
    turnoId,
    origen: 'MANUAL',
    notas,
    fechaModificacion: new Date().toISOString(),
  };

  if (idx >= 0) {
    db.asignaciones[idx] = nuevaAsignacion;
  } else {
    db.asignaciones.push(nuevaAsignacion);
  }

  // Registrar en historial
  const evento: HistorialEvento = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId,
    tipoEvento: 'ASIGNACION_MODIFICADA',
    empleadoId,
    empleadoNombre: emp ? `${emp.nombre} ${emp.apellidos}` : 'Empleado',
    fechaAfectada: fecha,
    turnoAnteriorCodigo: prevTurno?.codigo || 'AUTO',
    turnoNuevoCodigo: turno?.codigo || 'N/A',
    motivo: notas ? `Asignación manual: ${notas}` : 'Asignación manual introducida por gestión',
    usuarioNombre,
    timestamp: new Date().toISOString(),
  };

  db.historial.unshift(evento);
  repository.saveState(db);
}

/**
 * Elimina una asignación manual para que vuelva a calcularse por rotación o regla por defecto.
 */
export function restablecerTurnoBase(
  empresaId: string,
  empleadoId: string,
  fecha: string,
  usuarioNombre: string = 'Gestor de Turnos'
): void {
  const db = repository.getState();
  const idx = db.asignaciones.findIndex(
    (a) => a.empresaId === empresaId && a.empleadoId === empleadoId && a.fecha === fecha
  );

  if (idx >= 0) {
    const borrada = db.asignaciones[idx];
    const prevTurno = db.turnos.find((t) => t.id === borrada.turnoId);
    const emp = db.empleados.find((e) => e.id === empleadoId);

    db.asignaciones.splice(idx, 1);

    const evento: HistorialEvento = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      empresaId,
      tipoEvento: 'ASIGNACION_MODIFICADA',
      empleadoId,
      empleadoNombre: emp ? `${emp.nombre} ${emp.apellidos}` : 'Empleado',
      fechaAfectada: fecha,
      turnoAnteriorCodigo: prevTurno?.codigo,
      turnoNuevoCodigo: 'ROTACION_BASE',
      motivo: 'Restablecimiento a planificación base/rotación automática',
      usuarioNombre,
      timestamp: new Date().toISOString(),
    };

    db.historial.unshift(evento);
    repository.saveState(db);
  }
}
