import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Info,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  Edit3,
} from 'lucide-react';
import {
  Empleado,
  Turno,
  Grupo,
  TurnoOficialDia,
} from '../../domain/types.ts';
import {
  obtenerMatrizCuadrante,
  asignarTurnoManual,
  restablecerTurnoBase,
} from '../../usecases/planificacionUseCases.ts';
import { exportarCuadranteExcel } from '../../usecases/excelUseCases.ts';
import { ShiftBadge } from '../common/ShiftBadge.tsx';

interface CuadranteViewProps {
  empresaId: string;
  turnos: Turno[];
  grupos: Grupo[];
  empleados: Empleado[];
  onDatosCambiados: () => void;
  onIrAExcel: () => void;
}

export const CuadranteView: React.FC<CuadranteViewProps> = ({
  empresaId,
  turnos,
  grupos,
  empleados,
  onDatosCambiados,
  onIrAExcel,
}) => {
  // Rango de fechas por defecto: Septiembre 2026 (mes con datos ricos)
  const [fechaInicio, setFechaInicio] = useState('2026-09-21');
  const [fechaFin, setFechaFin] = useState('2026-10-04'); // 14 días quincenal
  const [filtroGrupo, setFiltroGrupo] = useState<string>('TODOS');
  const [filtroModalidad, setFiltroModalidad] = useState<'TODAS' | 'ROTATIVO' | 'FIJO'>('TODAS');

  // Celda seleccionada para inspección
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<{
    empleado: Empleado;
    fecha: string;
    info: TurnoOficialDia;
  } | null>(null);

  // Estado para modal de cambio manual
  const [turnoManualId, setTurnoManualId] = useState<string>('');
  const [motivoManual, setMotivoManual] = useState<string>('');

  // Generar cuadrante reactivo
  const cuadrante = useMemo(() => {
    const res = obtenerMatrizCuadrante(
      empresaId,
      fechaInicio,
      fechaFin,
      filtroGrupo !== 'TODOS' ? filtroGrupo : undefined
    );

    // Filtrar por modalidad si aplica
    let emps = res.empleados;
    if (filtroModalidad !== 'TODAS') {
      emps = emps.filter((e) => e.modalidadTrabajo === filtroModalidad);
    }

    return {
      ...res,
      empleados: emps,
    };
  }, [empresaId, fechaInicio, fechaFin, filtroGrupo, filtroModalidad]);

  // Navegar quincenas
  const moverQuincena = (direccion: number) => {
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    start.setDate(start.getDate() + direccion * 14);
    end.setDate(end.getDate() + direccion * 14);
    setFechaInicio(start.toISOString().slice(0, 10));
    setFechaFin(end.toISOString().slice(0, 10));
  };

  const handleAbrirInspeccion = (emp: Empleado, fecha: string) => {
    const info = cuadrante.grilla[emp.id]?.[fecha];
    if (info) {
      setCeldaSeleccionada({ empleado: emp, fecha, info });
      setTurnoManualId(info.turnoOficial.id);
      setMotivoManual('');
    }
  };

  const handleGuardarTurnoManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!celdaSeleccionada || !turnoManualId) return;

    asignarTurnoManual(
      empresaId,
      celdaSeleccionada.empleado.id,
      celdaSeleccionada.fecha,
      turnoManualId,
      'Gestor de Turnos',
      motivoManual || 'Ajuste manual directo'
    );

    setCeldaSeleccionada(null);
    onDatosCambiados();
  };

  const handleRestablecerBase = () => {
    if (!celdaSeleccionada) return;

    restablecerTurnoBase(
      empresaId,
      celdaSeleccionada.empleado.id,
      celdaSeleccionada.fecha,
      'Gestor de Turnos'
    );

    setCeldaSeleccionada(null);
    onDatosCambiados();
  };

  const formatearDiaHeader = (fechaStr: string) => {
    const parts = fechaStr.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const diaSemana = dias[date.getUTCDay()];
    const diaNum = parts[2];
    const esFinSemana = date.getUTCDay() === 0 || date.getUTCDay() === 6;

    return { diaSemana, diaNum, esFinSemana };
  };

  return (
    <div className="space-y-4">
      {/* Barra de control superior */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navegación temporal */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => moverQuincena(-1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="14 días antes"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-xs font-semibold text-slate-800 font-mono">
              {fechaInicio} <span className="text-slate-400 font-sans">al</span> {fechaFin}
            </div>
            <button
              type="button"
              onClick={() => moverQuincena(1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="14 días después"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setFechaInicio('2026-09-21');
              setFechaFin('2026-10-04');
            }}
            className="text-xs text-slate-600 hover:text-blue-600 px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
          >
            Hoy / Actual
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Grupo:</span>
            <select
              aria-label="Filtrar por grupo"
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODOS">Todos los Grupos</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Modalidad:</span>
            <select
              aria-label="Filtrar por modalidad"
              value={filtroModalidad}
              onChange={(e) => setFiltroModalidad(e.target.value as any)}
              className="border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODAS">Todas</option>
              <option value="ROTATIVO">Solo Rotativos</option>
              <option value="FIJO">Solo Fijos</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => exportarCuadranteExcel(empresaId, fechaInicio, fechaFin)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors ml-auto md:ml-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Principio Fundamental Banner informativo */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-semibold">Principio Fundamental del Sistema:</span> Cada celda muestra el{' '}
          <strong className="underline decoration-blue-400">Resultado Oficial</strong>. Haz clic sobre cualquier celda para
          desglosar su origen: <em>Planificación base</em>, <em>Solicitud del empleado</em>, <em>Excepción activa</em> o{' '}
          <em>Modificación autorizada</em>.
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono shrink-0 hidden lg:flex">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-blue-500" /> Rotación
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-emerald-500" /> Autorizado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-amber-500" /> Excepción
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-sky-400" /> Manual
          </span>
        </div>
      </div>

      {/* Matriz Cuadrante */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="sticky left-0 bg-slate-50 z-20 py-3 px-3 min-w-[200px] border-r border-slate-200 font-semibold text-slate-700">
                  Empleado / Grupo
                </th>
                {cuadrante.fechas.map((f) => {
                  const { diaSemana, diaNum, esFinSemana } = formatearDiaHeader(f);
                  return (
                    <th
                      key={f}
                      className={`py-2 px-1.5 text-center min-w-[50px] border-r border-slate-200 font-medium ${
                        esFinSemana ? 'bg-slate-100/70 text-slate-600' : 'text-slate-800'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono">{diaSemana}</div>
                      <div className="text-sm font-semibold">{diaNum}</div>
                    </th>
                  );
                })}
                <th className="py-3 px-3 text-center min-w-[70px] font-semibold text-slate-700 bg-slate-50">
                  Total Horas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cuadrante.empleados.length === 0 ? (
                <tr>
                  <td colSpan={cuadrante.fechas.length + 2} className="py-8 text-center text-slate-500">
                    No se encontraron empleados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                cuadrante.empleados.map((emp) => {
                  const grupo = emp.grupoId ? cuadrante.gruposMap[emp.grupoId] : null;

                  // Calcular total de horas para este empleado en el rango visible
                  let totalHoras = 0;
                  cuadrante.fechas.forEach((f) => {
                    const celda = cuadrante.grilla[emp.id]?.[f];
                    if (celda?.turnoOficial?.horasComputables) {
                      totalHoras += celda.turnoOficial.horasComputables;
                    }
                  });

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Columna Empleado (Sticky) */}
                      <td className="sticky left-0 bg-white z-10 py-2.5 px-3 border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">
                        <div className="font-medium text-slate-900">
                          {emp.nombre} {emp.apellidos}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{emp.identificacionInterna}</span>
                          <span>·</span>
                          <span
                            className={
                              emp.modalidadTrabajo === 'ROTATIVO' ? 'text-blue-600' : 'text-slate-600'
                            }
                          >
                            {emp.modalidadTrabajo}
                          </span>
                          {grupo && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[100px]">{grupo.nombre}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Celdas de fechas */}
                      {cuadrante.fechas.map((f) => {
                        const celda = cuadrante.grilla[emp.id]?.[f];
                        const turnoOficial = celda?.turnoOficial;
                        const tieneSolicitud = !!celda?.solicitudPendiente;
                        const tieneExcepcion = !!celda?.excepcionActiva;
                        const esAutorizado = celda?.origenOficial === 'MODIFICACION_AUTORIZADA';
                        const esModificado = celda?.esModificadoOficial;

                        return (
                          <td
                            key={f}
                            onClick={() => handleAbrirInspeccion(emp, f)}
                            className="py-1 px-1 text-center border-r border-slate-100 hover:bg-blue-50/50 cursor-pointer relative group transition-colors"
                          >
                            <div className="flex items-center justify-center relative">
                              <ShiftBadge
                                turno={turnoOficial}
                                origen={celda?.origenOficial}
                                esModificado={esModificado}
                                tamano="sm"
                              />

                              {/* Indicador de solicitud pendiente */}
                              {tieneSolicitud && (
                                <span
                                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"
                                  title="Solicitud pendiente de aprobación"
                                />
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Horas */}
                      <td className="py-2 px-3 text-center font-mono font-medium text-slate-700 bg-slate-50/50">
                        {totalHoras}h
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector de Celda (Planificación vs Solicitud vs Autorización vs Resultado Oficial) */}
      {celdaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Detalle y Trazabilidad de Asignación
                </h3>
                <p className="text-xs text-slate-500">
                  {celdaSeleccionada.empleado.nombre} {celdaSeleccionada.empleado.apellidos} ·{' '}
                  <span className="font-mono font-medium text-slate-700">{celdaSeleccionada.fecha}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCeldaSeleccionada(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Inspector */}
            <div className="p-5 space-y-4">
              {/* Sección Cascada de Principios */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Cadena de Determinación de Turno
                </div>

                {/* 1. Planificación Base */}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">1. Planificación Base:</span>
                  <div className="flex items-center gap-2">
                    <ShiftBadge turno={celdaSeleccionada.info.turnoPlanificado} tamano="sm" />
                    <span className="text-slate-600 font-mono text-[11px]">
                      ({celdaSeleccionada.info.origenPlanificado || 'ROTACION'})
                    </span>
                  </div>
                </div>

                {/* 2. Solicitud Pendiente (si existe) */}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">2. Solicitud del Empleado:</span>
                  <div>
                    {celdaSeleccionada.info.solicitudPendiente ? (
                      <span className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 font-medium">
                        {celdaSeleccionada.info.solicitudPendiente.tipo} (Pendiente)
                      </span>
                    ) : (
                      <span className="text-slate-400">Ninguna solicitud en curso</span>
                    )}
                  </div>
                </div>

                {/* 3. Excepción Activa (si existe) */}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">3. Excepción / Incidencia:</span>
                  <div>
                    {celdaSeleccionada.info.excepcionActiva ? (
                      <span className="text-amber-800 font-medium">
                        {celdaSeleccionada.info.excepcionActiva.tipo}:{' '}
                        {celdaSeleccionada.info.excepcionActiva.motivo}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sin excepciones</span>
                    )}
                  </div>
                </div>

                {/* 4. Autorización Oficial */}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">4. Autorización Formal:</span>
                  <div>
                    {celdaSeleccionada.info.origenOficial === 'MODIFICACION_AUTORIZADA' ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 font-medium">
                        Aprobada por{' '}
                        {celdaSeleccionada.info.autorizacion?.autorizadorNombre || 'Autorizador'}
                      </span>
                    ) : (
                      <span className="text-slate-400">No requerida / Base</span>
                    )}
                  </div>
                </div>

                {/* 5. RESULTADO OFICIAL */}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold text-slate-800">Resultado Oficial Definitivo:</span>
                  <div className="flex items-center gap-2">
                    <ShiftBadge
                      turno={celdaSeleccionada.info.turnoOficial}
                      origen={celdaSeleccionada.info.origenOficial}
                      tamano="md"
                      mostrarHoras
                    />
                  </div>
                </div>
              </div>

              {/* Formulario de Modificación Manual Directa */}
              <form onSubmit={handleGuardarTurnoManual} className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ajustar Turno Manualmente (Gestión)</span>
                  </label>
                  {celdaSeleccionada.info.origenOficial === 'MANUAL' && (
                    <button
                      type="button"
                      onClick={handleRestablecerBase}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Restablecer a rotación base
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <select
                      aria-label="Seleccionar Turno"
                      value={turnoManualId}
                      onChange={(e) => setTurnoManualId(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {turnos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.codigo} — {t.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Motivo del ajuste..."
                      value={motivoManual}
                      onChange={(e) => setMotivoManual(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCeldaSeleccionada(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Guardar Ajuste
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
