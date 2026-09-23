import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  Coffee,
  CalendarCheck,
  Send,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  Empleado,
  Turno,
  Grupo,
  Solicitud,
} from '../../domain/types.ts';
import { obtenerMatrizCuadrante } from '../../usecases/planificacionUseCases.ts';
import { ShiftBadge } from '../common/ShiftBadge.tsx';

interface MiPlanificacionViewProps {
  empresaId: string;
  empleadoActual: Empleado;
  grupo?: Grupo;
  solicitudes: Solicitud[];
  turnos: Turno[];
  onAbrirSolicitudParaFecha: (fecha: string) => void;
  onAbrirNuevaSolicitud: () => void;
}

export const MiPlanificacionView: React.FC<MiPlanificacionViewProps> = ({
  empresaId,
  empleadoActual,
  grupo,
  solicitudes,
  turnos,
  onAbrirSolicitudParaFecha,
  onAbrirNuevaSolicitud,
}) => {
  // Rango 14 días
  const [fechaInicio, setFechaInicio] = useState('2026-09-21');
  const [fechaFin, setFechaFin] = useState('2026-10-04');

  const fechaHoyStr = '2026-09-23'; // Fecha de simulación del brief

  const cuadrante = useMemo(() => {
    return obtenerMatrizCuadrante(empresaId, fechaInicio, fechaFin);
  }, [empresaId, fechaInicio, fechaFin]);

  // Turno de hoy
  const celdaHoy = useMemo(() => {
    const resHoy = obtenerMatrizCuadrante(empresaId, fechaHoyStr, fechaHoyStr);
    return resHoy.grilla[empleadoActual.id]?.[fechaHoyStr];
  }, [empresaId, empleadoActual.id]);

  // Próximo descanso a partir de hoy
  const proximoDescanso = useMemo(() => {
    for (const f of cuadrante.fechas) {
      if (f >= fechaHoyStr) {
        const celda = cuadrante.grilla[empleadoActual.id]?.[f];
        if (celda?.turnoOficial.esLibre) {
          return f;
        }
      }
    }
    return null;
  }, [cuadrante, empleadoActual.id]);

  // Total horas del período visible
  const totalHorasPeriodo = useMemo(() => {
    let sum = 0;
    cuadrante.fechas.forEach((f) => {
      const c = cuadrante.grilla[empleadoActual.id]?.[f];
      if (c?.turnoOficial?.horasComputables) {
        sum += c.turnoOficial.horasComputables;
      }
    });
    return sum;
  }, [cuadrante, empleadoActual.id]);

  const solicitudesPendientesEmpleado = solicitudes.filter(
    (s) => s.empresaId === empresaId && s.empleadoId === empleadoActual.id && s.estado === 'PENDIENTE'
  );

  const moverQuincena = (dir: number) => {
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    start.setDate(start.getDate() + dir * 14);
    end.setDate(end.getDate() + dir * 14);
    setFechaInicio(start.toISOString().slice(0, 10));
    setFechaFin(end.toISOString().slice(0, 10));
  };

  const formatearFechaLegible = (fechaStr: string) => {
    const parts = fechaStr.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    };
    return date.toLocaleDateString('es-ES', opciones);
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Perfil & Métricas del Empleado */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {empleadoActual.nombre} {empleadoActual.apellidos}
              </h2>
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {empleadoActual.identificacionInterna}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Modalidad: <strong className="text-slate-700">{empleadoActual.modalidadTrabajo}</strong></span>
              <span>·</span>
              <span>Grupo: <strong className="text-slate-700">{grupo?.nombre || 'Sin Grupo'}</strong></span>
              {empleadoActual.puesto && (
                <>
                  <span>·</span>
                  <span>{empleadoActual.puesto}</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onAbrirNuevaSolicitud}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Solicitar Cambio o Día Libre</span>
          </button>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Turno Hoy */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Turno Hoy (23 Sept):</span>
            </div>
            <div className="mt-1">
              <ShiftBadge
                turno={celdaHoy?.turnoOficial}
                origen={celdaHoy?.origenOficial}
                tamano="md"
                mostrarHoras
              />
            </div>
          </div>

          {/* Próximo Descanso */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-1">
              <Coffee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Próximo Descanso:</span>
            </div>
            <div className="font-semibold text-slate-900 mt-1">
              {proximoDescanso ? formatearFechaLegible(proximoDescanso) : 'No determinado'}
            </div>
          </div>

          {/* Horas Acumuladas */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-1">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Horas Período:</span>
            </div>
            <div className="font-semibold text-slate-900 font-mono mt-1 text-sm">
              {totalHorasPeriodo} horas
            </div>
          </div>

          {/* Solicitudes Pendientes */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Solicitudes Pendientes:</span>
            </div>
            <div className="font-semibold text-slate-900 mt-1">
              {solicitudesPendientesEmpleado.length > 0 ? (
                <span className="text-amber-700 font-bold">
                  {solicitudesPendientesEmpleado.length} en trámite
                </span>
              ) : (
                <span className="text-slate-400">Ninguna</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación temporal y Lista de Turnos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900">
            Mi Cuadrante de Turnos Próximos
          </h3>

          <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => moverQuincena(-1)}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="14 días antes"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 font-mono font-medium text-slate-800">
              {fechaInicio} al {fechaFin}
            </div>
            <button
              type="button"
              onClick={() => moverQuincena(1)}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="14 días después"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grilla de Días en formato Tarjeta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {cuadrante.fechas.map((f) => {
            const celda = cuadrante.grilla[empleadoActual.id]?.[f];
            const esHoy = f === fechaHoyStr;
            const turno = celda?.turnoOficial;
            const tieneSolicitud = !!celda?.solicitudPendiente;
            const esModificado = celda?.origenOficial === 'MODIFICACION_AUTORIZADA';

            return (
              <div
                key={f}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  esHoy
                    ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium capitalize text-slate-700">
                      {formatearFechaLegible(f)}
                    </span>
                    {esHoy && (
                      <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1 rounded">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Badge Turno */}
                  <div className="my-1.5 flex items-center justify-between">
                    <ShiftBadge
                      turno={turno}
                      origen={celda?.origenOficial}
                      esModificado={esModificado}
                      tamano="md"
                      mostrarHoras
                    />
                  </div>

                  {/* Indicadores */}
                  <div className="text-[11px] text-slate-500 space-y-0.5 mt-2">
                    <div>
                      {turno?.horaInicio
                        ? `${turno.horaInicio} - ${turno.horaFin}`
                        : turno?.esLibre
                        ? 'Libranza'
                        : 'Sin horario'}
                    </div>

                    {esModificado && (
                      <div className="text-emerald-700 font-medium">
                        ✓ Modificación autorizada
                      </div>
                    )}

                    {tieneSolicitud && (
                      <div className="text-amber-700 font-medium">
                        ⌛ Petición en trámite
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón rápido pedir cambio */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onAbrirSolicitudParaFecha(f)}
                    className="w-full text-center text-[11px] text-slate-600 hover:text-blue-600 font-medium hover:bg-slate-50 py-1 rounded"
                  >
                    Pedir cambio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
