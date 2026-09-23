import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  Empleado,
  Turno,
  Grupo,
} from '../../domain/types.ts';
import { obtenerMatrizCuadrante } from '../../usecases/planificacionUseCases.ts';
import { ShiftBadge } from '../common/ShiftBadge.tsx';

interface CompanerosViewProps {
  empresaId: string;
  empleadoActual: Empleado;
  empleados: Empleado[];
  grupos: Grupo[];
  turnos: Turno[];
  onIniciarPermutaCon: (companeroId: string, fecha: string) => void;
}

export const CompanerosView: React.FC<CompanerosViewProps> = ({
  empresaId,
  empleadoActual,
  empleados,
  grupos,
  turnos,
  onIniciarPermutaCon,
}) => {
  const [fechaInicio, setFechaInicio] = useState('2026-09-21');
  const [fechaFin, setFechaFin] = useState('2026-10-04');
  const [soloMiGrupo, setSoloMiGrupo] = useState(true);

  const cuadrante = useMemo(() => {
    const filtro = soloMiGrupo && empleadoActual.grupoId ? empleadoActual.grupoId : undefined;
    return obtenerMatrizCuadrante(empresaId, fechaInicio, fechaFin, filtro);
  }, [empresaId, fechaInicio, fechaFin, soloMiGrupo, empleadoActual.grupoId]);

  const moverQuincena = (dir: number) => {
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    start.setDate(start.getDate() + dir * 14);
    end.setDate(end.getDate() + dir * 14);
    setFechaInicio(start.toISOString().slice(0, 10));
    setFechaFin(end.toISOString().slice(0, 10));
  };

  const formatearDiaHeader = (fechaStr: string) => {
    const parts = fechaStr.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return { diaSemana: dias[date.getUTCDay()], diaNum: parts[2] };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Planificación del Equipo y Compañeros
          </h2>
          <p className="text-xs text-slate-500">
            Consulta los turnos de tus compañeros para coordinar descansos o solicitar permutas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={soloMiGrupo}
              onChange={(e) => setSoloMiGrupo(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="font-medium">Solo compañeros de mi grupo</span>
          </label>

          <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => moverQuincena(-1)}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-2 font-mono font-medium text-slate-800">
              {fechaInicio} al {fechaFin}
            </div>
            <button
              type="button"
              onClick={() => moverQuincena(1)}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Matriz del equipo */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="sticky left-0 bg-slate-50 z-20 py-3 px-3 min-w-[180px] border-r border-slate-200">
                  Compañero
                </th>
                {cuadrante.fechas.map((f) => {
                  const { diaSemana, diaNum } = formatearDiaHeader(f);
                  return (
                    <th
                      key={f}
                      className="py-2 px-1 text-center min-w-[46px] border-r border-slate-200"
                    >
                      <div className="text-[10px] uppercase font-mono text-slate-500">{diaSemana}</div>
                      <div className="text-xs font-semibold">{diaNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cuadrante.empleados.map((emp) => {
                const esYo = emp.id === empleadoActual.id;
                return (
                  <tr
                    key={emp.id}
                    className={`transition-colors ${
                      esYo ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="sticky left-0 bg-white z-10 py-2.5 px-3 border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900 truncate">
                          {emp.nombre} {emp.apellidos}
                        </span>
                        {esYo && (
                          <span className="text-[10px] text-blue-700 bg-blue-100 px-1 py-0.2 rounded font-bold">
                            TÚ
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {emp.identificacionInterna}
                      </div>
                    </td>

                    {cuadrante.fechas.map((f) => {
                      const celda = cuadrante.grilla[emp.id]?.[f];
                      const turno = celda?.turnoOficial;

                      return (
                        <td
                          key={f}
                          className="py-1 px-1 text-center border-r border-slate-100 group relative"
                        >
                          <div className="flex items-center justify-center">
                            <ShiftBadge
                              turno={turno}
                              origen={celda?.origenOficial}
                              tamano="sm"
                            />
                          </div>

                          {/* Botón rápido permutar si no soy yo y no es libre */}
                          {!esYo && (
                            <button
                              type="button"
                              onClick={() => onIniciarPermutaCon(emp.id, f)}
                              className="hidden group-hover:flex absolute inset-0 bg-blue-600/90 text-white text-[10px] font-semibold items-center justify-center rounded z-20 cursor-pointer shadow-xs"
                              title={`Solicitar permuta con ${emp.nombre} para el ${f}`}
                            >
                              Permutar
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
