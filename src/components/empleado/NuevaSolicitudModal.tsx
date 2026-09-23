import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  ArrowRightLeft,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Empleado,
  Turno,
  TipoSolicitud,
} from '../../domain/types.ts';
import { crearSolicitud } from '../../usecases/solicitudesUseCases.ts';
import { obtenerMatrizCuadrante } from '../../usecases/planificacionUseCases.ts';
import { ShiftBadge } from '../common/ShiftBadge.tsx';

interface NuevaSolicitudModalProps {
  empresaId: string;
  empleadoActual: Empleado;
  companeros: Empleado[];
  turnos: Turno[];
  fechaPreseleccionada?: string;
  onCerrar: () => void;
  onSolicitudCreada: () => void;
}

export const NuevaSolicitudModal: React.FC<NuevaSolicitudModalProps> = ({
  empresaId,
  empleadoActual,
  companeros,
  turnos,
  fechaPreseleccionada,
  onCerrar,
  onSolicitudCreada,
}) => {
  const [tipo, setTipo] = useState<TipoSolicitud>('DIA_LIBRE');
  const [fecha, setFecha] = useState<string>(fechaPreseleccionada || '2026-09-28');
  const [turnoPropuestoId, setTurnoPropuestoId] = useState<string>(turnos[0]?.id || '');
  const [empleadoDestinoId, setEmpleadoDestinoId] = useState<string>(
    companeros.find((c) => c.id !== empleadoActual.id)?.id || ''
  );
  const [fechaDestino, setFechaDestino] = useState<string>(fechaPreseleccionada || '2026-09-28');
  const [motivo, setMotivo] = useState<string>('');
  const [enviando, setEnviando] = useState(false);

  // Turno actual del solicitante en la fecha elegida
  const turnoActualSolicitante = useMemo(() => {
    if (!fecha) return null;
    const res = obtenerMatrizCuadrante(empresaId, fecha, fecha);
    return res.grilla[empleadoActual.id]?.[fecha]?.turnoOficial;
  }, [empresaId, fecha, empleadoActual.id]);

  // Turno actual del destinatario para permuta
  const turnoActualDestino = useMemo(() => {
    if (tipo !== 'PERMUTA' || !empleadoDestinoId || !fechaDestino) return null;
    const res = obtenerMatrizCuadrante(empresaId, fechaDestino, fechaDestino);
    return res.grilla[empleadoDestinoId]?.[fechaDestino]?.turnoOficial;
  }, [empresaId, tipo, empleadoDestinoId, fechaDestino]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      alert('Por favor indica el motivo de la solicitud.');
      return;
    }

    setEnviando(true);
    try {
      const turnoLibre = turnos.find((t) => t.esLibre);
      crearSolicitud({
        empresaId,
        empleadoId: empleadoActual.id,
        tipo,
        fecha,
        turnoPropuestoId: tipo === 'DIA_LIBRE' ? turnoLibre?.id : turnoPropuestoId,
        empleadoDestinoId: tipo === 'PERMUTA' ? empleadoDestinoId : undefined,
        fechaDestino: tipo === 'PERMUTA' ? fechaDestino : undefined,
        motivo: motivo.trim(),
      });

      onSolicitudCreada();
    } catch (err: any) {
      alert('Error al crear la solicitud: ' + (err.message || 'Error desconocido'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Crear Solicitud de Cambio</h3>
            <p className="text-xs text-slate-500">
              Solicitante: {empleadoActual.nombre} {empleadoActual.apellidos}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Tipo */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setTipo('DIA_LIBRE')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              tipo === 'DIA_LIBRE'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-xs'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4 mx-auto mb-1 text-blue-600" />
            <div className="text-xs">Día Libre</div>
          </button>

          <button
            type="button"
            onClick={() => setTipo('CAMBIO_TURNO')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              tipo === 'CAMBIO_TURNO'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-xs'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 mx-auto mb-1 text-amber-600" />
            <div className="text-xs">Cambio Turno</div>
          </button>

          <button
            type="button"
            onClick={() => setTipo('PERMUTA')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              tipo === 'PERMUTA'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-xs'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
            <div className="text-xs">Permuta</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Fecha del Solicitante */}
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Fecha Afectada:</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                if (tipo === 'PERMUTA') setFechaDestino(e.target.value);
              }}
              className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
            />
          </div>

          {/* Estado de Turno actual en esa fecha */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-600">Turno oficial que tienes asignado ese día:</span>
            <ShiftBadge turno={turnoActualSolicitante || undefined} tamano="sm" />
          </div>

          {/* OPCIONES SEGÚN TIPO */}
          {tipo === 'CAMBIO_TURNO' && (
            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Turno que Solicitas Realizar:
              </label>
              <select
                aria-label="Seleccionar turno propuesto"
                value={turnoPropuestoId}
                onChange={(e) => setTurnoPropuestoId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium"
              >
                {turnos
                  .filter((t) => !t.esLibre)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} — {t.nombre} ({t.horaInicio}-{t.horaFin})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {tipo === 'PERMUTA' && (
            <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-200">
              <div className="font-semibold text-blue-950">Datos del Intercambio (Permuta):</div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">
                  Compañero con quien permutar:
                </label>
                <select
                  aria-label="Seleccionar compañero para permutar"
                  value={empleadoDestinoId}
                  onChange={(e) => setEmpleadoDestinoId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white font-medium"
                >
                  {companeros
                    .filter((c) => c.id !== empleadoActual.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellidos} ({c.modalidadTrabajo})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">
                  Fecha del turno del compañero:
                </label>
                <input
                  type="date"
                  value={fechaDestino}
                  onChange={(e) => setFechaDestino(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white font-mono"
                />
              </div>

              {turnoActualDestino && (
                <div className="flex items-center justify-between text-[11px] text-blue-900 bg-white p-2 rounded border border-blue-100">
                  <span>Turno que realiza tu compañero en esa fecha:</span>
                  <ShiftBadge turno={turnoActualDestino} tamano="sm" />
                </div>
              )}
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-slate-600 mb-1 font-medium">
              Motivo o Justificación de la Solicitud:
            </label>
            <textarea
              rows={2}
              required
              placeholder="Explica brevemente el motivo de la petición..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-100 p-2 rounded-lg">
            * <strong>Nota:</strong> Tu solicitud será enviada a la persona autorizada. La
            planificación oficial no cambiará hasta que sea aprobada formalmente.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCerrar}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Solicitud</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
