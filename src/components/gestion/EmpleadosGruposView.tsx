import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  FolderPlus,
  Layers,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Briefcase,
  Calendar,
} from 'lucide-react';
import {
  Empleado,
  Grupo,
  Turno,
  ReglaRotacion,
  ModalidadEmpleado,
  EstadoEmpleado,
} from '../../domain/types.ts';
import {
  guardarEmpleado,
  guardarGrupo,
  eliminarGrupo,
  cambiarEstadoEmpleado,
} from '../../usecases/configuracionUseCases.ts';

interface EmpleadosGruposViewProps {
  empresaId: string;
  empleados: Empleado[];
  grupos: Grupo[];
  turnos: Turno[];
  reglasRotacion: ReglaRotacion[];
  onDatosCambiados: () => void;
}

export const EmpleadosGruposView: React.FC<EmpleadosGruposViewProps> = ({
  empresaId,
  empleados,
  grupos,
  turnos,
  reglasRotacion,
  onDatosCambiados,
}) => {
  const [tabActual, setTabActual] = useState<'EMPLEADOS' | 'GRUPOS'>('EMPLEADOS');

  // Modal Empleado
  const [modalEmpleadoAbierto, setModalEmpleadoAbierto] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<Empleado | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formIdent, setFormIdent] = useState('');
  const [formModalidad, setFormModalidad] = useState<ModalidadEmpleado>('ROTATIVO');
  const [formGrupoId, setFormGrupoId] = useState('');
  const [formTurnoFijoId, setFormTurnoFijoId] = useState('');
  const [formPuesto, setFormPuesto] = useState('');

  // Modal Grupo
  const [modalGrupoAbierto, setModalGrupoAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [formGrupoNombre, setFormGrupoNombre] = useState('');
  const [formGrupoDesc, setFormGrupoDesc] = useState('');
  const [formGrupoReglaId, setFormGrupoReglaId] = useState('');
  const [formGrupoFechaInicio, setFormGrupoFechaInicio] = useState('2026-09-01');
  const [formGrupoDesfase, setFormGrupoDesfase] = useState(0);

  const empleadosEmpresa = empleados.filter((e) => e.empresaId === empresaId);
  const gruposEmpresa = grupos.filter((g) => g.empresaId === empresaId);

  const abrirModalEmpleado = (emp?: Empleado) => {
    if (emp) {
      setEmpleadoEditando(emp);
      setFormNombre(emp.nombre);
      setFormApellidos(emp.apellidos);
      setFormIdent(emp.identificacionInterna);
      setFormModalidad(emp.modalidadTrabajo);
      setFormGrupoId(emp.grupoId || '');
      setFormTurnoFijoId(emp.turnoFijoPredeterminadoId || '');
      setFormPuesto(emp.puesto || '');
    } else {
      setEmpleadoEditando(null);
      setFormNombre('');
      setFormApellidos('');
      setFormIdent(`LEG-${Math.floor(1000 + Math.random() * 9000)}`);
      setFormModalidad('ROTATIVO');
      setFormGrupoId(gruposEmpresa[0]?.id || '');
      setFormTurnoFijoId(turnos[0]?.id || '');
      setFormPuesto('');
    }
    setModalEmpleadoAbierto(true);
  };

  const handleGuardarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    guardarEmpleado({
      id: empleadoEditando ? empleadoEditando.id : undefined,
      empresaId,
      nombre: formNombre.trim(),
      apellidos: formApellidos.trim(),
      identificacionInterna: formIdent.trim(),
      estado: empleadoEditando ? empleadoEditando.estado : 'ACTIVO',
      modalidadTrabajo: formModalidad,
      grupoId: formGrupoId || undefined,
      turnoFijoPredeterminadoId: formModalidad === 'FIJO' ? formTurnoFijoId || undefined : undefined,
      puesto: formPuesto.trim() || undefined,
    });

    setModalEmpleadoAbierto(false);
    onDatosCambiados();
  };

  const abrirModalGrupo = (grp?: Grupo) => {
    if (grp) {
      setGrupoEditando(grp);
      setFormGrupoNombre(grp.nombre);
      setFormGrupoDesc(grp.descripcion || '');
      setFormGrupoReglaId(grp.reglaRotacionId || '');
      setFormGrupoFechaInicio(grp.fechaInicioRotacion || '2026-09-01');
      setFormGrupoDesfase(grp.desfaseDias || 0);
    } else {
      setGrupoEditando(null);
      setFormGrupoNombre('');
      setFormGrupoDesc('');
      setFormGrupoReglaId(reglasRotacion[0]?.id || '');
      setFormGrupoFechaInicio('2026-09-01');
      setFormGrupoDesfase(0);
    }
    setModalGrupoAbierto(true);
  };

  const handleGuardarGrupo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGrupoNombre.trim()) return;

    guardarGrupo({
      id: grupoEditando ? grupoEditando.id : undefined,
      empresaId,
      nombre: formGrupoNombre.trim(),
      descripcion: formGrupoDesc.trim() || undefined,
      reglaRotacionId: formGrupoReglaId || undefined,
      fechaInicioRotacion: formGrupoFechaInicio,
      desfaseDias: Number(formGrupoDesfase) || 0,
    });

    setModalGrupoAbierto(false);
    onDatosCambiados();
  };

  const handleEliminarGrupo = (id: string) => {
    if (confirm('¿Eliminar este grupo? Los empleados asignados quedarán sin grupo.')) {
      eliminarGrupo(id);
      onDatosCambiados();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de Pestaña */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setTabActual('EMPLEADOS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                tabActual === 'EMPLEADOS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Empleados ({empleadosEmpresa.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTabActual('GRUPOS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                tabActual === 'GRUPOS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Grupos ({gruposEmpresa.length})</span>
            </button>
          </div>
        </div>

        {tabActual === 'EMPLEADOS' ? (
          <button
            type="button"
            onClick={() => abrirModalEmpleado()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrar Empleado</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => abrirModalGrupo()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Crear Grupo</span>
          </button>
        )}
      </div>

      {/* VISTA DE EMPLEADOS */}
      {tabActual === 'EMPLEADOS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Identificación</th>
                <th className="py-3 px-4">Nombre y Apellidos</th>
                <th className="py-3 px-4">Modalidad</th>
                <th className="py-3 px-4">Grupo Asignado</th>
                <th className="py-3 px-4">Puesto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empleadosEmpresa.map((emp) => {
                const grupo = grupos.find((g) => g.id === emp.grupoId);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {emp.identificacionInterna}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {emp.nombre} {emp.apellidos}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          emp.modalidadTrabajo === 'ROTATIVO'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {emp.modalidadTrabajo === 'ROTATIVO' ? 'Rotativo (Regla)' : 'Fijo (Directo)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {grupo ? grupo.nombre : <span className="text-slate-400 italic">Sin grupo</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{emp.puesto || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-medium ${
                          emp.estado === 'ACTIVO' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        ● {emp.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => abrirModalEmpleado(emp)}
                        className="text-slate-500 hover:text-blue-600 p-1 rounded"
                        title="Editar empleado"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA DE GRUPOS */}
      {tabActual === 'GRUPOS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gruposEmpresa.map((grp) => {
            const regla = reglasRotacion.find((r) => r.id === grp.reglaRotacionId);
            const miembros = empleadosEmpresa.filter((e) => e.grupoId === grp.id);

            return (
              <div
                key={grp.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-900">{grp.nombre}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => abrirModalGrupo(grp)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Editar grupo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarGrupo(grp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Eliminar grupo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">{grp.descripcion || 'Sin descripción'}</p>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Regla de Rotación:</span>
                      <strong className="text-slate-800">
                        {regla ? regla.nombre : 'Sin regla (Fijo)'}
                      </strong>
                    </div>
                    {grp.fechaInicioRotacion && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Inicio Anclaje:</span>
                        <span className="font-mono text-slate-700">{grp.fechaInicioRotacion}</span>
                      </div>
                    )}
                    {grp.desfaseDias !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Desfase de Ciclo:</span>
                        <span className="font-mono text-slate-700">+{grp.desfaseDias} días</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de Miembros */}
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <div className="text-[11px] font-medium text-slate-500 mb-1.5">
                    {miembros.length} Empleados Asignados:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {miembros.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No hay empleados asignados</span>
                    ) : (
                      miembros.map((m) => (
                        <span
                          key={m.id}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {m.nombre} {m.apellidos.charAt(0)}.
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Empleado */}
      {modalEmpleadoAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900">
                {empleadoEditando ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
              </h3>
              <button
                type="button"
                onClick={() => setModalEmpleadoAbierto(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEmpleado} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Nombre:</label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Apellidos:</label>
                  <input
                    type="text"
                    required
                    value={formApellidos}
                    onChange={(e) => setFormApellidos(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    Identificación / Legajo:
                  </label>
                  <input
                    type="text"
                    required
                    value={formIdent}
                    onChange={(e) => setFormIdent(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Puesto:</label>
                  <input
                    type="text"
                    value={formPuesto}
                    onChange={(e) => setFormPuesto(e.target.value)}
                    placeholder="ej: Operario"
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">
                  Modalidad de Trabajo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormModalidad('ROTATIVO')}
                    className={`py-2 px-3 rounded-lg border text-left font-medium ${
                      formModalidad === 'ROTATIVO'
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Rotativo
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Planificación por regla de rotación
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormModalidad('FIJO')}
                    className={`py-2 px-3 rounded-lg border text-left font-medium ${
                      formModalidad === 'FIJO'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Fijo
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Planificación directa continua
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Grupo:</label>
                <select
                  aria-label="Seleccionar grupo"
                  value={formGrupoId}
                  onChange={(e) => setFormGrupoId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                >
                  <option value="">Sin grupo asignado</option>
                  {gruposEmpresa.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {formModalidad === 'FIJO' && (
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    Turno Fijo Habitual:
                  </label>
                  <select
                    aria-label="Seleccionar turno fijo habitual"
                    value={formTurnoFijoId}
                    onChange={(e) => setFormTurnoFijoId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                  >
                    {turnos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.codigo} — {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEmpleadoAbierto(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Grupo */}
      {modalGrupoAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900">
                {grupoEditando ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
              </h3>
              <button
                type="button"
                onClick={() => setModalGrupoAbierto(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarGrupo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nombre del Grupo:</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Grupo A — Producción Línea 1"
                  value={formGrupoNombre}
                  onChange={(e) => setFormGrupoNombre(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Descripción:</label>
                <input
                  type="text"
                  value={formGrupoDesc}
                  onChange={(e) => setFormGrupoDesc(e.target.value)}
                  placeholder="Detalles sobre el área o rotación"
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">
                  Regla de Rotación Asociada:
                </label>
                <select
                  aria-label="Seleccionar regla de rotación asociada"
                  value={formGrupoReglaId}
                  onChange={(e) => setFormGrupoReglaId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                >
                  <option value="">Sin rotación automática (Fijo)</option>
                  {reglasRotacion.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} ({r.longitudDias} días)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    Fecha Anclaje (Día 1):
                  </label>
                  <input
                    type="date"
                    value={formGrupoFechaInicio}
                    onChange={(e) => setFormGrupoFechaInicio(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Desfase (Días):</label>
                  <input
                    type="number"
                    value={formGrupoDesfase}
                    onChange={(e) => setFormGrupoDesfase(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalGrupoAbierto(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Guardar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
