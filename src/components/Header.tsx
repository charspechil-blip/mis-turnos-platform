import React from 'react';
import {
  CalendarDays,
  Briefcase,
  User,
  Building2,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Empresa, Empleado } from '../domain/types.ts';

interface HeaderProps {
  empresas: Empresa[];
  empresaActualId: string;
  onCambiarEmpresa: (id: string) => void;
  modoVista: 'GESTION' | 'EMPLEADO';
  onCambiarModo: (modo: 'GESTION' | 'EMPLEADO') => void;
  empleadosEmpresa: Empleado[];
  empleadoActivoId?: string;
  onCambiarEmpleadoActivo: (id: string) => void;
  onResetDatos: () => void;
  solicitudesPendientesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  empresas,
  empresaActualId,
  onCambiarEmpresa,
  modoVista,
  onCambiarModo,
  empleadosEmpresa,
  empleadoActivoId,
  onCambiarEmpleadoActivo,
  onResetDatos,
  solicitudesPendientesCount,
}) => {
  const empresaActual = empresas.find((e) => e.id === empresaActualId);
  const empleadoActivo = empleadosEmpresa.find((e) => e.id === empleadoActivoId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">MIS TURNOS</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Planificación, Solicitudes y Resultado Oficial
              </p>
            </div>
          </div>

          {/* Selector de Empresa (Multi-empresa) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="font-medium hidden md:inline">Empresa:</span>
              <select
                aria-label="Seleccionar Empresa"
                value={empresaActualId}
                onChange={(e) => onCambiarEmpresa(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Modo: Gestión vs Empleado */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onCambiarModo('GESTION')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors relative ${
                  modoVista === 'GESTION'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Gestión</span>
                {solicitudesPendientesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title={`${solicitudesPendientesCount} solicitudes pendientes`} />
                )}
              </button>

              <button
                type="button"
                onClick={() => onCambiarModo('EMPLEADO')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  modoVista === 'EMPLEADO'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Empleado</span>
              </button>
            </div>

            {/* Selector de Empleado (cuando estamos en modo empleado) */}
            {modoVista === 'EMPLEADO' && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs border border-blue-200 bg-blue-50 text-blue-900 rounded-md px-2.5 py-1.5">
                <span className="font-semibold text-blue-800">Ver como:</span>
                <select
                  aria-label="Ver como empleado"
                  value={empleadoActivoId}
                  onChange={(e) => onCambiarEmpleadoActivo(e.target.value)}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1"
                >
                  {empleadosEmpresa.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} {e.apellidos} ({e.modalidadTrabajo})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Restablecer datos demostrativos */}
            <button
              type="button"
              onClick={onResetDatos}
              title="Restablecer datos originales del proyecto"
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
