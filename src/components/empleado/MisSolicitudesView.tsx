import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRightLeft,
  Calendar,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  Solicitud,
  Autorizacion,
  Empleado,
  Turno,
} from '../../domain/types.ts';
import { cancelarSolicitud } from '../../usecases/solicitudesUseCases.ts';
import { ShiftBadge } from '../common/ShiftBadge.tsx';

interface MisSolicitudesViewProps {
  empresaId: string;
  empleadoActual: Empleado;
  solicitudes: Solicitud[];
  autorizaciones: Autorizacion[];
  turnos: Turno[];
  empleados: Empleado[];
  onAbrirNuevaSolicitud: () => void;
  onDatosCambiados: () => void;
}

export const MisSolicitudesView: React.FC<MisSolicitudesViewProps> = ({
  empresaId,
  empleadoActual,
  solicitudes,
  autorizaciones,
  turnos,
  empleados,
  onAbrirNuevaSolicitud,
  onDatosCambiados,
}) => {
  const misSolicitudes = solicitudes.filter(
    (s) => s.empresaId === empresaId && s.empleadoId === empleadoActual.id
  );

  const autorizacionesMap = React.useMemo(() => {
    const map: Record<string, Autorizacion> = {};
    autorizaciones.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [autorizaciones]);

  const empleadosMap = React.useMemo(() => {
    const map: Record<string, Empleado> = {};
    empleados.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [empleados]);

  const turnosMap = React.useMemo(() => {
    const map: Record<string, Turno> = {};
    turnos.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [turnos]);

  const handleCancelar = (id: string) => {
    if (confirm('¿Deseas cancelar esta solicitud pendiente?')) {
      cancelarSolicitud(id);
      onDatosCambiados();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Mis Solicitudes y Peticiones
          </h2>
          <p className="text-xs text-slate-500">
            Consulta el estado de tus peticiones de días libres, cambios de turno y permutas
          </p>
        </div>

        <button
          type="button"
          onClick={onAbrirNuevaSolicitud}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {misSolicitudes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No has realizado ninguna solicitud todavía.
          </div>
        ) : (
          misSolicitudes.map((sol) => {
            const aut = sol.autorizacionId ? autorizacionesMap[sol.autorizacionId] : null;
            const destino = sol.empleadoDestinoId ? empleadosMap[sol.empleadoDestinoId] : null;
            const turnoPropuesto = sol.turnoPropuestoId ? turnosMap[sol.turnoPropuestoId] : null;

            return (
              <div
                key={sol.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                      {sol.tipo}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">#{sol.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">
                      Fecha afectada: <strong className="font-mono text-slate-700">{sol.fecha}</strong>
                    </span>
                  </div>

                  {/* Estado */}
                  <div>
                    {sol.estado === 'PENDIENTE' && (
                      <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>En Revisión</span>
                      </span>
                    )}
                    {sol.estado === 'APROBADA' && (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Aprobada Oficialmente</span>
                      </span>
                    )}
                    {sol.estado === 'RECHAZADA' && (
                      <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Rechazada</span>
                      </span>
                    )}
                    {sol.estado === 'CANCELADA' && (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        Cancelada
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalle */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-slate-500">Petición:</span>
                  {sol.tipo === 'DIA_LIBRE' && (
                    <strong className="text-slate-800">Día de descanso / libranza</strong>
                  )}
                  {sol.tipo === 'CAMBIO_TURNO' && (
                    <div className="flex items-center gap-1">
                      <span>Cambio a:</span>
                      <ShiftBadge turno={turnoPropuesto} tamano="sm" />
                    </div>
                  )}
                  {sol.tipo === 'PERMUTA' && destino && (
                    <div className="flex items-center gap-1">
                      <span>Permuta de turno con</span>
                      <strong>
                        {destino.nombre} {destino.apellidos}
                      </strong>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 italic">"{sol.motivo}"</p>

                {/* Respuesta del supervisor */}
                {aut && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5 flex items-start gap-2 text-emerald-950">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{aut.autorizadorNombre}:</span>{' '}
                      <span>"{aut.comentarioResolucion}"</span>
                      <span className="text-emerald-700/70 text-[10px] ml-2 font-mono">
                        ({new Date(aut.fechaDecision).toLocaleDateString('es-ES')})
                      </span>
                    </div>
                  </div>
                )}

                {/* Botón cancelar si está pendiente */}
                {sol.estado === 'PENDIENTE' && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleCancelar(sol.id)}
                      className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Cancelar mi solicitud</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
