import React, { useState } from 'react';
import {
  Clock,
  RotateCw,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Calendar,
  X,
  Play,
} from 'lucide-react';
import {
  Turno,
  ReglaRotacion,
  PasoRotacion,
} from '../../domain/types.ts';
import {
  guardarTurno,
  guardarReglaRotacion,
} from '../../usecases/configuracionUseCases.ts';
import { calculateRotationShift } from '../../domain/rules/rotationCalculator.ts';
import { ShiftBadge } from '../common/ShiftBadge.tsx';

interface TurnosRotacionesViewProps {
  empresaId: string;
  turnos: Turno[];
  reglasRotacion: ReglaRotacion[];
  onDatosCambiados: () => void;
}

export const TurnosRotacionesView: React.FC<TurnosRotacionesViewProps> = ({
  empresaId,
  turnos,
  reglasRotacion,
  onDatosCambiados,
}) => {
  const [tabActual, setTabActual] = useState<'TURNOS' | 'REGLAS'>('TURNOS');

  // Modal Turno
  const [modalTurnoAbierto, setModalTurnoAbierto] = useState(false);
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null);
  const [formCodigo, setFormCodigo] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formEsLibre, setFormEsLibre] = useState(false);
  const [formHoraInicio, setFormHoraInicio] = useState('08:00');
  const [formHoraFin, setFormHoraFin] = useState('16:00');
  const [formHoras, setFormHoras] = useState(8);
  const [formColor, setFormColor] = useState('#2563eb');
  const [formDesc, setFormDesc] = useState('');

  // Modal Regla Rotación
  const [modalReglaAbierto, setModalReglaAbierto] = useState(false);
  const [reglaEditando, setReglaEditando] = useState<ReglaRotacion | null>(null);
  const [formReglaNombre, setFormReglaNombre] = useState('');
  const [formReglaDesc, setFormReglaDesc] = useState('');
  const [formLongitudDias, setFormLongitudDias] = useState(8);
  const [formPasos, setFormPasos] = useState<PasoRotacion[]>([]);

  // Simulador de Rotación
  const [simuladorReglaId, setSimuladorReglaId] = useState<string>('');
  const [simuladorFechaInicio, setSimuladorFechaInicio] = useState('2026-09-01');
  const [simuladorFechaTest, setSimuladorFechaTest] = useState('2026-09-23');
  const [simuladorDesfase, setSimuladorDesfase] = useState(0);

  const turnosEmpresa = turnos.filter((t) => t.empresaId === empresaId);
  const reglasEmpresa = reglasRotacion.filter((r) => r.empresaId === empresaId);

  const turnosMap = React.useMemo(() => {
    const map: Record<string, Turno> = {};
    turnosEmpresa.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [turnosEmpresa]);

  const abrirModalTurno = (t?: Turno) => {
    if (t) {
      setTurnoEditando(t);
      setFormCodigo(t.codigo);
      setFormNombre(t.nombre);
      setFormEsLibre(t.esLibre);
      setFormHoraInicio(t.horaInicio || '08:00');
      setFormHoraFin(t.horaFin || '16:00');
      setFormHoras(t.horasComputables);
      setFormColor(t.colorHex || '#2563eb');
      setFormDesc(t.descripcion || '');
    } else {
      setTurnoEditando(null);
      setFormCodigo('T' + (turnosEmpresa.length + 1));
      setFormNombre('Turno ');
      setFormEsLibre(false);
      setFormHoraInicio('08:00');
      setFormHoraFin('16:00');
      setFormHoras(8);
      setFormColor('#2563eb');
      setFormDesc('');
    }
    setModalTurnoAbierto(true);
  };

  const handleGuardarTurno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCodigo.trim()) return;

    guardarTurno({
      id: turnoEditando ? turnoEditando.id : undefined,
      empresaId,
      codigo: formCodigo.trim().toUpperCase(),
      nombre: formNombre.trim(),
      esLibre: formEsLibre,
      horaInicio: formEsLibre ? undefined : formHoraInicio,
      horaFin: formEsLibre ? undefined : formHoraFin,
      horasComputables: formEsLibre ? 0 : Number(formHoras),
      colorHex: formColor,
      descripcion: formDesc.trim() || undefined,
    });

    setModalTurnoAbierto(false);
    onDatosCambiados();
  };

  const abrirModalRegla = (r?: ReglaRotacion) => {
    if (r) {
      setReglaEditando(r);
      setFormReglaNombre(r.nombre);
      setFormReglaDesc(r.descripcion || '');
      setFormLongitudDias(r.longitudDias);
      setFormPasos([...r.pasos]);
    } else {
      setReglaEditando(null);
      setFormReglaNombre('Nueva Rotación');
      setFormReglaDesc('');
      const defaultLen = 8;
      setFormLongitudDias(defaultLen);
      // Inicializar pasos con los turnos disponibles
      const defaultTurno = turnosEmpresa[0]?.id || '';
      const pasosIniciales: PasoRotacion[] = [];
      for (let i = 1; i <= defaultLen; i++) {
        pasosIniciales.push({ diaCiclo: i, turnoId: defaultTurno });
      }
      setFormPasos(pasosIniciales);
    }
    setModalReglaAbierto(true);
  };

  const cambiarLongitudDias = (nuevaLong: number) => {
    const n = Math.max(2, Math.min(60, nuevaLong));
    setFormLongitudDias(n);

    const defaultTurno = turnosEmpresa[0]?.id || '';
    const nuevosPasos: PasoRotacion[] = [];
    for (let i = 1; i <= n; i++) {
      const existing = formPasos.find((p) => p.diaCiclo === i);
      nuevosPasos.push(existing || { diaCiclo: i, turnoId: defaultTurno });
    }
    setFormPasos(nuevosPasos);
  };

  const actualizarPasoTurno = (diaCiclo: number, turnoId: string) => {
    setFormPasos((prev) =>
      prev.map((p) => (p.diaCiclo === diaCiclo ? { ...p, turnoId } : p))
    );
  };

  const handleGuardarRegla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReglaNombre.trim()) return;

    guardarReglaRotacion({
      id: reglaEditando ? reglaEditando.id : undefined,
      empresaId,
      nombre: formReglaNombre.trim(),
      descripcion: formReglaDesc.trim() || undefined,
      longitudDias: formLongitudDias,
      pasos: formPasos,
    });

    setModalReglaAbierto(false);
    onDatosCambiados();
  };

  // Cálculo de simulación reactiva
  const resultadoSimulador = React.useMemo(() => {
    const regla = reglasEmpresa.find((r) => r.id === (simuladorReglaId || reglasEmpresa[0]?.id));
    if (!regla) return null;

    return calculateRotationShift(
      regla,
      simuladorFechaInicio,
      simuladorFechaTest,
      Number(simuladorDesfase),
      turnosMap
    );
  }, [simuladorReglaId, reglasEmpresa, simuladorFechaInicio, simuladorFechaTest, simuladorDesfase, turnosMap]);

  return (
    <div className="space-y-4">
      {/* Selector de Pestaña */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setTabActual('TURNOS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                tabActual === 'TURNOS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Catálogo de Turnos ({turnosEmpresa.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTabActual('REGLAS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                tabActual === 'REGLAS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reglas de Rotación ({reglasEmpresa.length})</span>
            </button>
          </div>
        </div>

        {tabActual === 'TURNOS' ? (
          <button
            type="button"
            onClick={() => abrirModalTurno()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Turno</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => abrirModalRegla()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Regla de Rotación</span>
          </button>
        )}
      </div>

      {/* CATÁLOGO DE TURNOS */}
      {tabActual === 'TURNOS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {turnosEmpresa.map((turno) => (
            <div
              key={turno.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShiftBadge turno={turno} tamano="lg" />
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{turno.nombre}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Código: {turno.codigo}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirModalTurno(turno)}
                    className="text-slate-400 hover:text-blue-600 p-1"
                    title="Editar turno"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600">{turno.descripcion || 'Sin descripción'}</p>

                <div className="bg-slate-50 rounded-lg p-2 text-xs border border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Horario:</span>
                    <strong className="text-slate-800">
                      {turno.esLibre
                        ? 'Día de Descanso'
                        : `${turno.horaInicio || '--:--'} - ${turno.horaFin || '--:--'}`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Horas Computables:</span>
                    <span className="font-mono text-slate-700">{turno.horasComputables} horas</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REGLAS DE ROTACIÓN */}
      {tabActual === 'REGLAS' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {reglasEmpresa.map((regla) => (
              <div
                key={regla.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{regla.nombre}</h3>
                    <p className="text-xs text-slate-500">{regla.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      Ciclo de {regla.longitudDias} días
                    </span>
                    <button
                      type="button"
                      onClick={() => abrirModalRegla(regla)}
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title="Editar regla"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Línea de tiempo visual del ciclo */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Secuencia del Ciclo (Día 1 al {regla.longitudDias}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {regla.pasos.map((p) => {
                      const turno = turnosMap[p.turnoId];
                      return (
                        <div
                          key={p.diaCiclo}
                          className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-lg p-2 min-w-[56px]"
                        >
                          <span className="text-[10px] text-slate-500 font-mono mb-1">
                            Día {p.diaCiclo}
                          </span>
                          <ShiftBadge turno={turno} tamano="sm" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simulador Interactivo de Rotación */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="font-semibold text-sm">Simulador y Verificador de Regla de Rotación</h4>
            </div>
            <p className="text-xs text-slate-300">
              Prueba la determinación automática: elige una regla, una fecha de anclaje inicial y una fecha de destino para ver qué turno corresponde matemáticamente en el ciclo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Regla:</label>
                <select
                  aria-label="Seleccionar regla para el simulador"
                  value={simuladorReglaId}
                  onChange={(e) => setSimuladorReglaId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {reglasEmpresa.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Fecha de Anclaje (Día 1):</label>
                <input
                  type="date"
                  value={simuladorFechaInicio}
                  onChange={(e) => setSimuladorFechaInicio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Fecha a Calcular:</label>
                <input
                  type="date"
                  value={simuladorFechaTest}
                  onChange={(e) => setSimuladorFechaTest(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Desfase (Días):</label>
                <input
                  type="number"
                  value={simuladorDesfase}
                  onChange={(e) => setSimuladorDesfase(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Resultado del simulador */}
            <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-300">
                Resultado para el <strong>{simuladorFechaTest}</strong>:
              </span>
              {resultadoSimulador ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Posición en ciclo: <strong>Día {resultadoSimulador.diaCiclo}</strong>
                  </span>
                  <ShiftBadge turno={resultadoSimulador.turno} tamano="md" />
                </div>
              ) : (
                <span className="text-xs text-slate-400">No se pudo determinar</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Turno */}
      {modalTurnoAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900">
                {turnoEditando ? 'Editar Turno' : 'Nuevo Turno'}
              </h3>
              <button
                type="button"
                onClick={() => setModalTurnoAbierto(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarTurno} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Código:</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="ej: T1, NOC"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value.toUpperCase())}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Tipo:</label>
                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formEsLibre}
                      onChange={(e) => setFormEsLibre(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-medium text-slate-800">Es Descanso / Libre</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Turno Mañana (06:00 - 14:00)"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                />
              </div>

              {!formEsLibre && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Hora Inicio:</label>
                    <input
                      type="time"
                      value={formHoraInicio}
                      onChange={(e) => setFormHoraInicio(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Hora Fin:</label>
                    <input
                      type="time"
                      value={formHoraFin}
                      onChange={(e) => setFormHoraFin(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Horas:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formHoras}
                      onChange={(e) => setFormHoras(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Descripción:</label>
                <input
                  type="text"
                  placeholder="Observaciones de cobertura..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalTurnoAbierto(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Guardar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Regla Rotación */}
      {modalReglaAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-5 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900">
                {reglaEditando ? 'Editar Regla de Rotación' : 'Definir Nueva Regla de Rotación'}
              </h3>
              <button
                type="button"
                onClick={() => setModalReglaAbierto(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarRegla} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-600 mb-1 font-medium">Nombre de la Regla:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Ciclo 6x2 (2M, 2T, 2N, 2L)"
                    value={formReglaNombre}
                    onChange={(e) => setFormReglaNombre(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Longitud Ciclo (Días):</label>
                  <input
                    type="number"
                    min={2}
                    max={60}
                    value={formLongitudDias}
                    onChange={(e) => cambiarLongitudDias(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Descripción:</label>
                <input
                  type="text"
                  placeholder="Detalles sobre rotación y descanso..."
                  value={formReglaDesc}
                  onChange={(e) => setFormReglaDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                />
              </div>

              {/* Editor visual de los días del ciclo */}
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Configuración paso a paso del ciclo ({formLongitudDias} días):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                  {formPasos.map((paso) => (
                    <div
                      key={paso.diaCiclo}
                      className="border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1"
                    >
                      <div className="font-semibold text-slate-700 text-[11px]">
                        Día {paso.diaCiclo} del Ciclo
                      </div>
                      <select
                        aria-label={`Seleccionar turno para el día ${paso.diaCiclo} del ciclo`}
                        value={paso.turnoId}
                        onChange={(e) => actualizarPasoTurno(paso.diaCiclo, e.target.value)}
                        className="w-full border border-slate-200 rounded p-1 bg-white text-xs font-medium"
                      >
                        {turnosEmpresa.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.codigo} ({t.nombre})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalReglaAbierto(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Guardar Regla de Rotación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
