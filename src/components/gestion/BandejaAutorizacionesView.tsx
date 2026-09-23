import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightLeft,
  Calendar,
  User,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  Solicitud,
  Autorizacion,
  Empleado,
  Turno,
  TipoSolicitud,
} from '../../domain/types.ts';
import {
  aprobarSolicitud,
  rechazarSolicitud,
} from '../../usecases/solicitudesUseCases.ts';
import { ShiftBadge } from '../common/ShiftBadge.tsx';

interface BandejaAutorizacionesViewProps {
  empresaId: string;
  solicitudes: Solicitud[];
  autorizaciones: Autorizacion[];
  empleados: Empleado[];
  turnos: Turno[];
  onDatosCambiados: () => void;
}

export const BandejaAutorizacionesView: React.FC<BandejaAutorizacionesViewProps> = ({
  empresaId,
  solicitudes,
  autorizaciones,
  empleados,
  turnos,
  onDatosCambiados,
}) => {
  const [tabEstado, setTabEstado] = useState<'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'TODAS'>('PENDIENTE');
  const [solicitudEnResolucion, setSolicitudEnResolucion] = useState<{
    solicitud: Solicitud;
    tipoAccion: 'APROBAR' | 'RECHAZAR';
  } | null>(null);
  const [comentario, setComentario] = useState('');

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

  const autorizacionesMap = React.useMemo(() => {
    const map: Record<string, Autorizacion> = {};
    autorizaciones.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [autorizaciones]);

  const solicitudesFiltradas = solicitudes.filter((s) => {
    if (s.empresaId !== empresaId) return false;
    if (tabEstado === 'TODAS') return true;
    return s.estado === tabEstado;
  });

  const pendientesCount = solicitudes.filter(
    (s) => s.empresaId === empresaId && s.estado === 'PENDIENTE'
  ).length;

  const handleConfirmarResolucion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitudEnResolucion) return;

    const { solicitud, tipoAccion } = solicitudEnResolucion;

    if (tipoAccion === 'APROBAR') {
      aprobarSolicitud({
        solicitudId: solicitud.id,
        autorizadorUsuarioId: 'usr-gestor',
        autorizadorNombre: 'Javier Ordóñez (Supervisor)',
        comentarioResolucion: comentario || 'Aprobado conforme',
      });
    } else {
      rechazarSolicitud({
        solicitudId: solicitud.id,
        autorizadorUsuarioId: 'usr-gestor',
        autorizadorNombre: 'Javier Ordóñez (Supervisor)',
        comentarioResolucion: comentario || 'Rechazado por necesidades de cobertura',
      });
    }

    setSolicitudEnResolucion(null);
    setComentario('');
    onDatosCambiados();
  };

  const getTipoBadge = (tipo: TipoSolicitud) => {
    switch (tipo) {
      case 'DIA_LIBRE':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 text-xs px-2 py-0.5 rounded font-medium">
            <Calendar className="w-3 h-3 text-slate-500" /> Día Libre
          </span>
        );
      case 'PERMUTA':
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 text-xs px-2 py-0.5 rounded font-medium">
            <ArrowRightLeft className="w-3 h-3 text-blue-500" /> Permuta entre Empleados
          </span>
        );
      case 'CAMBIO_TURNO':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 text-xs px-2 py-0.5 rounded font-medium">
            <Clock className="w-3 h-3 text-amber-500" /> Cambio de Turno
          </span>
        );
      default:
        return <span className="text-xs text-slate-600 font-medium">{tipo}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header y Filtro por Estado */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Bandeja de Solicitudes y Autorizaciones
          </h2>
          <p className="text-xs text-slate-500">
            Aprueba o rechaza solicitudes de cambios de turno, días libres y permutas atómicas
          </p>
        </div>

        {/* Pestañas de estado */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setTabEstado('PENDIENTE')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              tabEstado === 'PENDIENTE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pendientes</span>
            {pendientesCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {pendientesCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTabEstado('APROBADA')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              tabEstado === 'APROBADA'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aprobadas
          </button>
          <button
            type="button"
            onClick={() => setTabEstado('RECHAZADA')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              tabEstado === 'RECHAZADA'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rechazadas
          </button>
          <button
            type="button"
            onClick={() => setTabEstado('TODAS')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              tabEstado === 'TODAS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div className="space-y-3">
        {solicitudesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No hay solicitudes en estado <strong>{tabEstado}</strong>.
          </div>
        ) : (
          solicitudesFiltradas.map((sol) => {
            const solicitante = empleadosMap[sol.empleadoId];
            const destino = sol.empleadoDestinoId ? empleadosMap[sol.empleadoDestinoId] : null;
            const turnoPropuesto = sol.turnoPropuestoId ? turnosMap[sol.turnoPropuestoId] : null;
            const turnoOrigSol = sol.turnoOriginalSolicitanteId
              ? turnosMap[sol.turnoOriginalSolicitanteId]
              : null;
            const turnoOrigDest = sol.turnoOriginalDestinoId
              ? turnosMap[sol.turnoOriginalDestinoId]
              : null;

            const autorizacion = sol.autorizacionId ? autorizacionesMap[sol.autorizacionId] : null;

            return (
              <div
                key={sol.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info Solicitante y Tipo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {getTipoBadge(sol.tipo)}
                      <span className="text-xs text-slate-400 font-mono">#{sol.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        {new Date(sol.fechaCreacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">
                        {solicitante ? `${solicitante.nombre} ${solicitante.apellidos}` : 'Empleado'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        ({solicitante?.identificacionInterna || 'LEG-?'})
                      </span>
                    </div>

                    {/* Detalle del cambio propuesto */}
                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-wrap items-center gap-3">
                      <div>
                        <span className="text-slate-400">Fecha:</span>{' '}
                        <strong className="font-mono text-slate-900">{sol.fecha}</strong>
                      </div>

                      {sol.tipo === 'DIA_LIBRE' && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Turno Planificado:</span>
                          <ShiftBadge turno={turnoOrigSol} tamano="sm" />
                          <span className="text-slate-400">→ Solicitado:</span>
                          <span className="font-medium text-slate-800">Descanso / Libre</span>
                        </div>
                      )}

                      {sol.tipo === 'CAMBIO_TURNO' && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Turno Planificado:</span>
                          <ShiftBadge turno={turnoOrigSol} tamano="sm" />
                          <span className="text-slate-400">→ Solicitado:</span>
                          <ShiftBadge turno={turnoPropuesto} tamano="sm" />
                        </div>
                      )}

                      {sol.tipo === 'PERMUTA' && destino && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700 font-medium">Permuta con:</span>
                          <strong className="text-slate-900">
                            {destino.nombre} {destino.apellidos}
                          </strong>
                          <span className="text-slate-400">({sol.fechaDestino || sol.fecha}):</span>
                          <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                            <span>{solicitante?.nombre}:</span>
                            <ShiftBadge turno={turnoOrigSol} tamano="sm" />
                            <span>↔</span>
                            <span>{destino.nombre}:</span>
                            <ShiftBadge turno={turnoOrigDest} tamano="sm" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Motivo */}
                    <p className="text-xs text-slate-600 italic">
                      "{sol.motivo}"
                    </p>

                    {/* Información de Autorización si ya fue resuelta */}
                    {autorizacion && (
                      <div className="text-xs text-slate-500 pt-1 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {autorizacion.decision === 'APROBADA' ? 'Aprobada' : 'Rechazada'} por{' '}
                          <strong>{autorizacion.autorizadorNombre}</strong>:{' '}
                          <em>"{autorizacion.comentarioResolucion}"</em>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones o Estado */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {sol.estado === 'PENDIENTE' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSolicitudEnResolucion({ solicitud: sol, tipoAccion: 'RECHAZAR' });
                            setComentario('');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSolicitudEnResolucion({ solicitud: sol, tipoAccion: 'APROBAR' });
                            setComentario('Conforme, solicitud autorizada');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aprobar Solicitud</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1 ${
                          sol.estado === 'APROBADA'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {sol.estado === 'APROBADA' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{sol.estado}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Resolución Formal */}
      {solicitudEnResolucion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  solicitudEnResolucion.tipoAccion === 'APROBAR'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {solicitudEnResolucion.tipoAccion === 'APROBAR' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {solicitudEnResolucion.tipoAccion === 'APROBAR'
                    ? 'Aprobar Solicitud y Actualizar Turno Oficial'
                    : 'Rechazar Solicitud'}
                </h3>
                <p className="text-xs text-slate-500">
                  Solicitud #{solicitudEnResolucion.solicitud.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              {solicitudEnResolucion.tipoAccion === 'APROBAR'
                ? 'Al aprobar, el sistema aplicará automáticamente el cambio como Modificación Autorizada en el cuadrante oficial y quedará reflejado en el historial.'
                : 'Al rechazar, la planificación oficial permanecerá intacta y se registrará la justificación.'}
            </p>

            <form onSubmit={handleConfirmarResolucion} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Comentario u Observaciones del Autorizador:
                </label>
                <textarea
                  rows={2}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe el motivo o resolución..."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSolicitudEnResolucion(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-colors ${
                    solicitudEnResolucion.tipoAccion === 'APROBAR'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {solicitudEnResolucion.tipoAccion === 'APROBAR' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
