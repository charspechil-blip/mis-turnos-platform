import {
  Empleado,
  Grupo,
  ReglaRotacion,
  Turno,
  Asignacion,
  Excepcion,
  Solicitud,
  Autorizacion,
  TurnoOficialDia,
  OrigenAsignacion,
} from '../types.ts';
import { calculateRotationShift, parseDateOnly } from './rotationCalculator.ts';

export interface ResolverContext {
  turnosMap: Record<string, Turno>;
  gruposMap: Record<string, Grupo>;
  reglasMap: Record<string, ReglaRotacion>;
  turnoLibrePorDefecto: Turno;
  asignaciones: Asignacion[];
  excepciones: Excepcion[];
  solicitudes: Solicitud[];
  autorizacionesMap: Record<string, Autorizacion>;
}

/**
 * Resuelve el Turno Oficial y la trazabilidad completa para un empleado en una fecha.
 */
export function resolveOfficialScheduleForDay(
  empleado: Empleado,
  fecha: string, // YYYY-MM-DD
  context: ResolverContext
): TurnoOficialDia {
  const {
    turnosMap,
    gruposMap,
    reglasMap,
    turnoLibrePorDefecto,
    asignaciones,
    excepciones,
    solicitudes,
    autorizacionesMap,
  } = context;

  // 1. DETERMINAR PLANIFICACIÓN BASE
  let turnoPlanificado: Turno = turnoLibrePorDefecto;
  let origenPlanificado: OrigenAsignacion = 'MANUAL';

  if (empleado.modalidadTrabajo === 'ROTATIVO') {
    const grupo = empleado.grupoId ? gruposMap[empleado.grupoId] : null;
    const regla = grupo?.reglaRotacionId ? reglasMap[grupo.reglaRotacionId] : null;
    const fechaInicio = grupo?.fechaInicioRotacion || '2026-01-01';
    const desfase = grupo?.desfaseDias || 0;

    if (regla) {
      const rot = calculateRotationShift(regla, fechaInicio, fecha, desfase, turnosMap);
      if (rot) {
        turnoPlanificado = rot.turno;
        origenPlanificado = 'ROTACION';
      }
    }
  } else {
    // Empleado Fijo
    const dateObj = parseDateOnly(fecha);
    const dayOfWeek = dateObj.getUTCDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const diasDescanso = empleado.diasDescansoFijo ?? [0, 6]; // Sábados y Domingos por defecto

    if (diasDescanso.includes(dayOfWeek)) {
      turnoPlanificado = turnoLibrePorDefecto;
      origenPlanificado = 'MANUAL';
    } else if (empleado.turnoFijoPredeterminadoId && turnosMap[empleado.turnoFijoPredeterminadoId]) {
      turnoPlanificado = turnosMap[empleado.turnoFijoPredeterminadoId];
      origenPlanificado = 'MANUAL';
    }
  }

  // Verificar si hay asignación previa guardada (ej. introducida manualmente o importada)
  const asignacionGuardada = asignaciones.find(
    (a) => a.empleadoId === empleado.id && a.fecha === fecha
  );

  if (asignacionGuardada && asignacionGuardada.origen !== 'MODIFICACION_AUTORIZADA') {
    const t = turnosMap[asignacionGuardada.turnoId];
    if (t) {
      turnoPlanificado = t;
      origenPlanificado = asignacionGuardada.origen;
    }
  }

  // 2. BUSCAR SOLICITUDES PENDIENTES
  // Una solicitud PENDIENTE no altera la planificación oficial, pero se expone en la interfaz.
  const solicitudPendiente = solicitudes.find(
    (s) =>
      s.empleadoId === empleado.id &&
      s.estado === 'PENDIENTE' &&
      (s.fecha === fecha || (s.fechaFin && s.fecha <= fecha && fecha <= s.fechaFin))
  );

  // 3. BUSCAR EXCEPCIONES ACTIVAS (Vacaciones, Licencias, Bajas)
  const excepcionActiva = excepciones.find(
    (e) =>
      e.empleadoId === empleado.id &&
      e.estado === 'ACTIVA' &&
      e.fechaInicio <= fecha &&
      fecha <= e.fechaFin
  );

  // 4. VERIFICAR MODIFICACIÓN AUTORIZADA
  // Prioridad 1: Asignación originada por una autorización formal (ej: solicitud aprobada o permuta)
  let autorizacionRelacionada: Autorizacion | undefined = undefined;

  if (asignacionGuardada && asignacionGuardada.origen === 'MODIFICACION_AUTORIZADA') {
    const turnoModificado = turnosMap[asignacionGuardada.turnoId];
    if (asignacionGuardada.solicitudId) {
      const sol = solicitudes.find((s) => s.id === asignacionGuardada.solicitudId);
      if (sol?.autorizacionId && autorizacionesMap[sol.autorizacionId]) {
        autorizacionRelacionada = autorizacionesMap[sol.autorizacionId];
      }
    }

    if (turnoModificado) {
      return {
        fecha,
        empleadoId: empleado.id,
        turnoPlanificado,
        origenPlanificado,
        solicitudPendiente,
        excepcionActiva,
        turnoOficial: turnoModificado,
        origenOficial: 'MODIFICACION_AUTORIZADA',
        autorizacion: autorizacionRelacionada,
        esModificadoOficial: turnoModificado.id !== turnoPlanificado.id,
      };
    }
  }

  // Prioridad 2: Excepción activa
  if (excepcionActiva) {
    const turnoExcepcion = excepcionActiva.turnoReemplazoId
      ? turnosMap[excepcionActiva.turnoReemplazoId] || turnoLibrePorDefecto
      : turnoLibrePorDefecto;

    return {
      fecha,
      empleadoId: empleado.id,
      turnoPlanificado,
      origenPlanificado,
      solicitudPendiente,
      excepcionActiva,
      turnoOficial: turnoExcepcion,
      origenOficial: 'EXCEPCION',
      autorizacion: undefined,
      esModificadoOficial: turnoExcepcion.id !== turnoPlanificado.id,
    };
  }

  // Prioridad 3: Planificación base
  return {
    fecha,
    empleadoId: empleado.id,
    turnoPlanificado,
    origenPlanificado,
    solicitudPendiente,
    excepcionActiva,
    turnoOficial: turnoPlanificado,
    origenOficial: origenPlanificado,
    autorizacion: undefined,
    esModificadoOficial: false,
  };
}
