import React, { useState } from 'react';
import {
  CalendarOff,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  Excepcion,
  Empleado,
  Turno,
  TipoExcepcion,
} from '../../domain/types.ts';
import {
  registrarExcepcion,
  cancelarExcepcion,
} from '../../usecases/excepcionesUseCases.ts';

interface ExcepcionesViewProps {
  empresaId: string;
  excepciones: Excepcion[];
  empleados: Empleado[];
  turnos: Turno[];
  onDatosCambiados: () => void;
}

export const ExcepcionesView: React.FC<ExcepcionesViewProps> = ({
  empresaId,
  excepciones,
  empleados,
  turnos,
  onDatosCambiados,
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoId, setEmpleadoId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-10-07');
  const [tipo, setTipo] = useState<TipoExcepcion>('VACACIONES');
  const [turnoReemplazoId, setTurnoReemplazoId] = useState('');
  const [motivo, setMotivo] = useState('');

  const empleadosEmpresa = empleados.filter((e) => e.empresaId === empresaId);
  const excepcionesEmpresa = excepciones.filter((e) => e.empresaId === empresaId);

  const empleadosMap = React.useMemo(() => {
    const map: Record<string, Empleado> = {};
    empleadosEmpresa.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [empleadosEmpresa]);

  const abrirModal = () => {
    setEmpleadoId(empleadosEmpresa[0]?.id || '');
    setFechaInicio('2026-10-01');
    setFechaFin('2026-10-07');
    setTipo('VACACIONES');
    setTurnoReemplazoId('');
    setMotivo('');
    setModalAbierto(true);
  };

  const handleRegistrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoId || !motivo.trim()) return;

    registrarExcepcion({
      empresaId,
      empleadoId,
      fechaInicio,
      fechaFin,
      tipo,
      turnoReemplazoId: turnoReemplazoId || undefined,
      motivo: motivo.trim(),
      usuarioNombre: 'Responsable de RRHH / Planificación',
    });

    setModalAbierto(false);
    onDatosCambiados();
  };

  const handleCancelar = (id: string) => {
    if (confirm('¿Desea cancelar esta excepción? La planificación volverá a su estado normal.')) {
      cancelarExcepcion(id, 'Gestor');
      onDatosCambiados();
    }
  };

  const tipoLabels: Record<TipoExcepcion, string> = {
    VACACIONES: 'Vacaciones Anuales',
    LICENCIA: 'Licencia Retribuida',
    BAJA_MEDICA: 'Baja Médica / Incapacidad Temporal',
    AUSENCIA_JUSTIFICADA: 'Ausencia Justificada',
    MODIFICACION_TEMPORAL: 'Modificación Temporal de Turno',
    OTRO: 'Otra Excepción',
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Registro de Excepciones y Alteraciones Temporales
          </h2>
          <p className="text-xs text-slate-500">
            Vacaciones, licencias, bajas y ausencias que alteran temporalmente la planificación normal
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Excepción</span>
        </button>
      </div>

      {/* Lista de excepciones */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4">Empleado</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Período Afectado</th>
              <th className="py-3 px-4">Turno Asignado</th>
              <th className="py-3 px-4">Motivo / Justificante</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {excepcionesEmpresa.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No hay excepciones registradas en la empresa.
                </td>
              </tr>
            ) : (
              excepcionesEmpresa.map((exc) => {
                const emp = empleadosMap[exc.empleadoId];
                const turno = exc.turnoReemplazoId
                  ? turnos.find((t) => t.id === exc.turnoReemplazoId)
                  : null;

                return (
                  <tr key={exc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {emp ? `${emp.nombre} ${emp.apellidos}` : 'Empleado'}
                      <div className="text-[11px] text-slate-500 font-mono">
                        {emp?.identificacionInterna}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                        {tipoLabels[exc.tipo] || exc.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {exc.fechaInicio} <span className="text-slate-400">al</span> {exc.fechaFin}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {turno ? turno.nombre : 'Descanso / Libre'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{exc.motivo}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-medium ${
                          exc.estado === 'ACTIVA' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        ● {exc.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {exc.estado === 'ACTIVA' && (
                        <button
                          type="button"
                          onClick={() => handleCancelar(exc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          title="Cancelar excepción"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900">
                Registrar Excepción Temporal
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegistrar} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Empleado:</label>
                <select
                  aria-label="Seleccionar empleado"
                  value={empleadoId}
                  onChange={(e) => setEmpleadoId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium"
                >
                  {empleadosEmpresa.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} {e.apellidos} ({e.identificacionInterna})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Tipo de Excepción:</label>
                <select
                  aria-label="Seleccionar tipo de excepción"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium"
                >
                  <option value="VACACIONES">Vacaciones</option>
                  <option value="LICENCIA">Licencia Retribuida</option>
                  <option value="BAJA_MEDICA">Baja Médica / Incapacidad Temporal</option>
                  <option value="AUSENCIA_JUSTIFICADA">Ausencia Justificada</option>
                  <option value="MODIFICACION_TEMPORAL">Modificación Temporal de Turno</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Fecha Inicio:</label>
                  <input
                    type="date"
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Fecha Fin:</label>
                  <input
                    type="date"
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Motivo / Detalle:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Justificante o motivo..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Registrar Excepción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
