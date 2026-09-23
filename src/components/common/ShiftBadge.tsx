import React from 'react';
import { Turno, OrigenAsignacion } from '../../domain/types.ts';

interface ShiftBadgeProps {
  turno?: Turno | null;
  origen?: OrigenAsignacion | 'EXCEPCION';
  esModificado?: boolean;
  tamano?: 'sm' | 'md' | 'lg';
  mostrarHoras?: boolean;
}

export const ShiftBadge: React.FC<ShiftBadgeProps> = ({
  turno,
  origen,
  esModificado = false,
  tamano = 'md',
  mostrarHoras = false,
}) => {
  if (!turno) {
    return <span className="text-slate-400 text-xs font-mono">-</span>;
  }

  const isFree = turno.esLibre;
  const isAuthorized = origen === 'MODIFICACION_AUTORIZADA';
  const isException = origen === 'EXCEPCION';

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 min-w-[28px]',
    md: 'text-xs px-2 py-1 min-w-[34px]',
    lg: 'text-sm px-2.5 py-1.5 min-w-[42px]',
  }[tamano];

  // Visual styling adapted cleanly
  let bgStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let indicator = null;

  if (isFree) {
    bgStyle = 'bg-slate-100 text-slate-500 border-slate-300 font-normal';
  } else if (isException) {
    bgStyle = 'bg-amber-50 text-amber-800 border-amber-300 font-medium';
    indicator = <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block mr-1" title="Excepción activa (Vacaciones/Baja)" />;
  } else if (isAuthorized) {
    bgStyle = 'bg-emerald-50 text-emerald-800 border-emerald-400 font-semibold ring-1 ring-emerald-300/60';
    indicator = <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block mr-1" title="Modificación autorizada oficialmente" />;
  } else if (origen === 'ROTACION') {
    bgStyle = 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
  } else if (origen === 'IMPORTACION') {
    bgStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-medium';
  } else {
    // Manual
    bgStyle = 'bg-sky-50 text-sky-800 border-sky-300 font-medium';
  }

  return (
    <span
      className={`inline-flex items-center justify-center border rounded font-mono tracking-tight transition-all select-none ${bgStyle} ${sizeClasses}`}
      title={`${turno.nombre} (${turno.codigo})${turno.horaInicio ? ` · ${turno.horaInicio}-${turno.horaFin}` : ''}${origen ? ` · Origen: ${origen}` : ''}`}
    >
      {indicator}
      <span>{turno.codigo}</span>
      {mostrarHoras && turno.horasComputables > 0 && (
        <span className="ml-1 opacity-70 font-sans text-[10px]">{turno.horasComputables}h</span>
      )}
    </span>
  );
};
