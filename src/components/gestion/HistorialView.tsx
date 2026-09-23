import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
  User,
  FileSpreadsheet,
} from 'lucide-react';
import { HistorialEvento, TipoEventoHistorial } from '../../domain/types.ts';

interface HistorialViewProps {
  empresaId: string;
  historial: HistorialEvento[];
}

export const HistorialView: React.FC<HistorialViewProps> = ({ empresaId, historial }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  const historialEmpresa = historial.filter((h) => h.empresaId === empresaId);

  const eventosFiltrados = historialEmpresa.filter((item) => {
    if (filtroTipo !== 'TODOS' && item.tipoEvento !== filtroTipo) {
      return false;
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchEmp = item.empleadoNombre?.toLowerCase().includes(q);
      const matchMotivo = item.motivo.toLowerCase().includes(q);
      const matchUser = item.usuarioNombre.toLowerCase().includes(q);
      const matchRef = item.referenciaId?.toLowerCase().includes(q);
      return matchEmp || matchMotivo || matchUser || matchRef;
    }
    return true;
  });

  const getBadgeEvento = (tipo: TipoEventoHistorial) => {
    switch (tipo) {
      case 'SOLICITUD_APROBADA':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            Solicitud Aprobada
          </span>
        );
      case 'SOLICITUD_RECHAZADA':
        return (
          <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            Solicitud Rechazada
          </span>
        );
      case 'PERMUTA_APLICADA':
        return (
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            Permuta Aplicada
          </span>
        );
      case 'SOLICITUD_CREADA':
        return (
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Solicitud Registrada
          </span>
        );
      case 'EXCEPCION_REGISTRADA':
        return (
          <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
            Excepción / Vacaciones
          </span>
        );
      case 'IMPORTACION_EXCEL':
        return (
          <span className="text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
            Importación Excel
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            {tipo}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controles de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Historial de Cambios y Trazabilidad
          </h2>
          <p className="text-xs text-slate-500">
            Registro inmutable de asignaciones, solicitudes, resoluciones y operaciones oficiales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por empleado, motivo, autorizador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
            />
          </div>

          {/* Filtro tipo */}
          <select
            aria-label="Filtrar por tipo de evento"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium"
          >
            <option value="TODOS">Todos los eventos</option>
            <option value="SOLICITUD_APROBADA">Solicitudes Aprobadas</option>
            <option value="SOLICITUD_RECHAZADA">Solicitudes Rechazadas</option>
            <option value="PERMUTA_APLICADA">Permutas</option>
            <option value="EXCEPCION_REGISTRADA">Excepciones / Vacaciones</option>
            <option value="ASIGNACION_MODIFICADA">Asignaciones Manuales</option>
            <option value="IMPORTACION_EXCEL">Importación Excel</option>
          </select>
        </div>
      </div>

      {/* Lista cronológica */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {eventosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No se encontraron eventos con los filtros indicados.
            </div>
          ) : (
            eventosFiltrados.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getBadgeEvento(item.tipoEvento)}
                    {item.referenciaId && (
                      <span className="font-mono text-slate-400 text-[11px]">
                        Ref: #{item.referenciaId}
                      </span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(item.timestamp).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="font-medium text-slate-900 text-sm">
                    {item.motivo}
                  </div>

                  {item.empleadoNombre && (
                    <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                      <span>
                        Empleado afectado: <strong>{item.empleadoNombre}</strong>
                      </span>
                      {item.fechaAfectada && (
                        <span>
                          Fecha: <strong className="font-mono">{item.fechaAfectada}</strong>
                        </span>
                      )}
                      {item.turnoAnteriorCodigo && item.turnoNuevoCodigo && (
                        <span className="flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          <span>{item.turnoAnteriorCodigo}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-blue-700">{item.turnoNuevoCodigo}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-slate-500 text-[11px]">Registrado por</div>
                  <div className="font-medium text-slate-800">{item.usuarioNombre}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
