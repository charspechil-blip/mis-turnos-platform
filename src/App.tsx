import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  FileCheck2,
  Users2,
  RotateCw,
  CalendarOff,
  History,
  FileSpreadsheet,
  Plus,
  Send,
  Building,
} from 'lucide-react';
import { repository } from './data/storage.ts';
import {
  Empresa,
  Empleado,
  Grupo,
  Turno,
  ReglaRotacion,
  Solicitud,
  Autorizacion,
  HistorialEvento,
  Excepcion,
} from './domain/types.ts';
import { Header } from './components/Header.tsx';

// Vistas de Gestión
import { CuadranteView } from './components/gestion/CuadranteView.tsx';
import { BandejaAutorizacionesView } from './components/gestion/BandejaAutorizacionesView.tsx';
import { EmpleadosGruposView } from './components/gestion/EmpleadosGruposView.tsx';
import { TurnosRotacionesView } from './components/gestion/TurnosRotacionesView.tsx';
import { ExcepcionesView } from './components/gestion/ExcepcionesView.tsx';
import { HistorialView } from './components/gestion/HistorialView.tsx';
import { ExcelCenterView } from './components/gestion/ExcelCenterView.tsx';

// Vistas de Empleado
import { MiPlanificacionView } from './components/empleado/MiPlanificacionView.tsx';
import { MisSolicitudesView } from './components/empleado/MisSolicitudesView.tsx';
import { CompanerosView } from './components/empleado/CompanerosView.tsx';
import { NuevaSolicitudModal } from './components/empleado/NuevaSolicitudModal.tsx';

export default function App() {
  const [dbState, setDbState] = useState(() => repository.getState());
  const [empresaActualId, setEmpresaActualId] = useState<string>('emp-1');
  const [modoVista, setModoVista] = useState<'GESTION' | 'EMPLEADO'>('GESTION');

  // Subnavegación Gestión
  const [seccionGestion, setSeccionGestion] = useState<
    'CUADRANTE' | 'AUTORIZACIONES' | 'EMPLEADOS_GRUPOS' | 'TURNOS_ROTACIONES' | 'EXCEPCIONES' | 'HISTORIAL' | 'EXCEL'
  >('CUADRANTE');

  // Subnavegación Empleado
  const [seccionEmpleado, setSeccionEmpleado] = useState<
    'MI_PLANIFICACION' | 'MIS_SOLICITUDES' | 'COMPANEROS'
  >('MI_PLANIFICACION');

  // Empleado seleccionado para modo Empleado
  const [empleadoActivoId, setEmpleadoActivoId] = useState<string>('emp-carlos');

  // Modal de Solicitud para Empleado
  const [modalSolicitudAbierto, setModalSolicitudAbierto] = useState(false);
  const [fechaPreseleccionada, setFechaPreseleccionada] = useState<string | undefined>(undefined);

  // Recarga reactiva de datos
  const refrescarDatos = useCallback(() => {
    setDbState(repository.getState());
  }, []);

  const handleResetDatos = () => {
    if (confirm('¿Restablecer la base de datos con los datos iniciales de demostración?')) {
      const state = repository.resetToDefault();
      setDbState(state);
      setEmpresaActualId('emp-1');
      setEmpleadoActivoId('emp-carlos');
    }
  };

  // Filtrar entidades de la empresa seleccionada
  const empresaActual = dbState.empresas.find((e) => e.id === empresaActualId) || dbState.empresas[0];
  const empleadosEmpresa = dbState.empleados.filter((e) => e.empresaId === empresaActualId);
  const gruposEmpresa = dbState.grupos.filter((g) => g.empresaId === empresaActualId);
  const turnosEmpresa = dbState.turnos.filter((t) => t.empresaId === empresaActualId);
  const reglasEmpresa = dbState.reglasRotacion.filter((r) => r.empresaId === empresaActualId);
  const solicitudesEmpresa = dbState.solicitudes.filter((s) => s.empresaId === empresaActualId);
  const autorizacionesEmpresa = dbState.autorizaciones.filter((a) => a.empresaId === empresaActualId);
  const excepcionesEmpresa = dbState.excepciones.filter((e) => e.empresaId === empresaActualId);
  const historialEmpresa = dbState.historial.filter((h) => h.empresaId === empresaActualId);

  // Asegurar empleado activo válido
  useEffect(() => {
    if (!empleadosEmpresa.some((e) => e.id === empleadoActivoId)) {
      if (empleadosEmpresa.length > 0) {
        setEmpleadoActivoId(empleadosEmpresa[0].id);
      }
    }
  }, [empleadosEmpresa, empleadoActivoId]);

  const empleadoActivo =
    empleadosEmpresa.find((e) => e.id === empleadoActivoId) || empleadosEmpresa[0];
  const grupoEmpleadoActivo = empleadoActivo?.grupoId
    ? gruposEmpresa.find((g) => g.id === empleadoActivo.grupoId)
    : undefined;

  const solicitudesPendientesCount = solicitudesEmpresa.filter(
    (s) => s.estado === 'PENDIENTE'
  ).length;

  const abrirSolicitudParaFecha = (f: string) => {
    setFechaPreseleccionada(f);
    setModalSolicitudAbierto(true);
  };

  const handleIniciarPermutaDesdeCompaneros = (companeroId: string, f: string) => {
    setFechaPreseleccionada(f);
    setModalSolicitudAbierto(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header General */}
      <Header
        empresas={dbState.empresas}
        empresaActualId={empresaActualId}
        onCambiarEmpresa={(id) => setEmpresaActualId(id)}
        modoVista={modoVista}
        onCambiarModo={(m) => setModoVista(m)}
        empleadosEmpresa={empleadosEmpresa}
        empleadoActivoId={empleadoActivoId}
        onCambiarEmpleadoActivo={(id) => setEmpleadoActivoId(id)}
        onResetDatos={handleResetDatos}
        solicitudesPendientesCount={solicitudesPendientesCount}
      />

      {/* Barra de Subnavegación de Sección */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {modoVista === 'GESTION' ? (
            <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto py-2 text-xs">
              <button
                type="button"
                onClick={() => setSeccionGestion('CUADRANTE')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                  seccionGestion === 'CUADRANTE'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>Cuadrante General</span>
              </button>

              <button
                type="button"
                onClick={() => setSeccionGestion('AUTORIZACIONES')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                  seccionGestion === 'AUTORIZACIONES'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                <span>Solicitudes y Autorizaciones</span>
                {solicitudesPendientesCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {solicitudesPendientesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSeccionGestion('EMPLEADOS_GRUPOS')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                  seccionGestion === 'EMPLEADOS_GRUPOS'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users2 className="w-4 h-4 text-slate-600" />
                <span>Empleados y Grupos</span>
              </button>

              <button
                type="button"
                onClick={() => setSeccionGestion('TURNOS_ROTACIONES')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                  seccionGestion === 'TURNOS_ROTACIONES'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <RotateCw className="w-4 h-4 text-slate-600" />
                <span>Turnos y Rotaciones</span>
              </button>

              <button
                type="button"
                onClick={() => setSeccionGestion('EXCEPCIONES')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                  seccionGestion === 'EXCEPCIONES'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarOff className="w-4 h-4 text-slate-600" />
                <span>Excepciones y Vacaciones</span>
              </button>

              <button
                type="button"
                onClick={() => setSeccionGestion('HISTORIAL')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                  seccionGestion === 'HISTORIAL'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <History className="w-4 h-4 text-slate-600" />
                <span>Historial de Cambios</span>
              </button>

              <button
                type="button"
                onClick={() => setSeccionGestion('EXCEL')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                  seccionGestion === 'EXCEL'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Importar / Exportar Excel</span>
              </button>
            </nav>
          ) : (
            <div className="flex items-center justify-between py-2 text-xs">
              <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSeccionEmpleado('MI_PLANIFICACION')}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                    seccionEmpleado === 'MI_PLANIFICACION'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span>Mi Planificación y Turnos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeccionEmpleado('MIS_SOLICITUDES')}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                    seccionEmpleado === 'MIS_SOLICITUDES'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  <span>Mis Solicitudes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeccionEmpleado('COMPANEROS')}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors shrink-0 ${
                    seccionEmpleado === 'COMPANEROS'
                      ? 'bg-blue-50 text-blue-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users2 className="w-4 h-4 text-slate-600" />
                  <span>Compañeros de Equipo</span>
                </button>
              </nav>

              <button
                type="button"
                onClick={() => {
                  setFechaPreseleccionada(undefined);
                  setModalSolicitudAbierto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva Solicitud</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {modoVista === 'GESTION' ? (
          <div>
            {seccionGestion === 'CUADRANTE' && (
              <CuadranteView
                empresaId={empresaActualId}
                turnos={turnosEmpresa}
                grupos={gruposEmpresa}
                empleados={empleadosEmpresa}
                onDatosCambiados={refrescarDatos}
                onIrAExcel={() => setSeccionGestion('EXCEL')}
              />
            )}

            {seccionGestion === 'AUTORIZACIONES' && (
              <BandejaAutorizacionesView
                empresaId={empresaActualId}
                solicitudes={solicitudesEmpresa}
                autorizaciones={autorizacionesEmpresa}
                empleados={empleadosEmpresa}
                turnos={turnosEmpresa}
                onDatosCambiados={refrescarDatos}
              />
            )}

            {seccionGestion === 'EMPLEADOS_GRUPOS' && (
              <EmpleadosGruposView
                empresaId={empresaActualId}
                empleados={empleadosEmpresa}
                grupos={gruposEmpresa}
                turnos={turnosEmpresa}
                reglasRotacion={reglasEmpresa}
                onDatosCambiados={refrescarDatos}
              />
            )}

            {seccionGestion === 'TURNOS_ROTACIONES' && (
              <TurnosRotacionesView
                empresaId={empresaActualId}
                turnos={turnosEmpresa}
                reglasRotacion={reglasEmpresa}
                onDatosCambiados={refrescarDatos}
              />
            )}

            {seccionGestion === 'EXCEPCIONES' && (
              <ExcepcionesView
                empresaId={empresaActualId}
                excepciones={excepcionesEmpresa}
                empleados={empleadosEmpresa}
                turnos={turnosEmpresa}
                onDatosCambiados={refrescarDatos}
              />
            )}

            {seccionGestion === 'HISTORIAL' && (
              <HistorialView
                empresaId={empresaActualId}
                historial={historialEmpresa}
              />
            )}

            {seccionGestion === 'EXCEL' && (
              <ExcelCenterView
                empresaId={empresaActualId}
                onDatosCambiados={refrescarDatos}
              />
            )}
          </div>
        ) : (
          <div>
            {empleadoActivo ? (
              <div>
                {seccionEmpleado === 'MI_PLANIFICACION' && (
                  <MiPlanificacionView
                    empresaId={empresaActualId}
                    empleadoActual={empleadoActivo}
                    grupo={grupoEmpleadoActivo}
                    solicitudes={solicitudesEmpresa}
                    turnos={turnosEmpresa}
                    onAbrirSolicitudParaFecha={abrirSolicitudParaFecha}
                    onAbrirNuevaSolicitud={() => {
                      setFechaPreseleccionada(undefined);
                      setModalSolicitudAbierto(true);
                    }}
                  />
                )}

                {seccionEmpleado === 'MIS_SOLICITUDES' && (
                  <MisSolicitudesView
                    empresaId={empresaActualId}
                    empleadoActual={empleadoActivo}
                    solicitudes={solicitudesEmpresa}
                    autorizaciones={autorizacionesEmpresa}
                    turnos={turnosEmpresa}
                    empleados={empleadosEmpresa}
                    onAbrirNuevaSolicitud={() => {
                      setFechaPreseleccionada(undefined);
                      setModalSolicitudAbierto(true);
                    }}
                    onDatosCambiados={refrescarDatos}
                  />
                )}

                {seccionEmpleado === 'COMPANEROS' && (
                  <CompanerosView
                    empresaId={empresaActualId}
                    empleadoActual={empleadoActivo}
                    empleados={empleadosEmpresa}
                    grupos={gruposEmpresa}
                    turnos={turnosEmpresa}
                    onIniciarPermutaCon={handleIniciarPermutaDesdeCompaneros}
                  />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
                No hay empleados activos en esta empresa. Regresa a Gestión para registrar empleados.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Nueva Solicitud (accesible desde cualquier punto en modo empleado) */}
      {modalSolicitudAbierto && empleadoActivo && (
        <NuevaSolicitudModal
          empresaId={empresaActualId}
          empleadoActual={empleadoActivo}
          companeros={empleadosEmpresa}
          turnos={turnosEmpresa}
          fechaPreseleccionada={fechaPreseleccionada}
          onCerrar={() => setModalSolicitudAbierto(false)}
          onSolicitudCreada={() => {
            setModalSolicitudAbierto(false);
            refrescarDatos();
          }}
        />
      )}

      {/* Footer sobrio */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>MIS TURNOS</strong> · Sistema Integral de Gestión y Planificación de Turnos Laborales
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Arquitectura Desacoplada: Dominio · Casos de Uso · Persistencia · UI
          </div>
        </div>
      </footer>
    </div>
  );
}
