import { repository } from '../data/storage.ts';
import {
  Solicitud,
  Autorizacion,
  TipoSolicitud,
  Asignacion,
  HistorialEvento,
  CambioAplicado,
} from '../domain/types.ts';
import { obtenerMatrizCuadrante } from './planificacionUseCases.ts';

export interface CrearSolicitudParams {
  empresaId: string;
  empleadoId: string;
  tipo: TipoSolicitud;
  fecha: string;
  fechaFin?: string;
  turnoPropuestoId?: string;
  empleadoDestinoId?: string;
  fechaDestino?: string;
  motivo: string;
}

/**
 * Crea una nueva solicitud formulada por un empleado.
 * No altera la planificación oficial.
 */
export function crearSolicitud(params: CrearSolicitudParams): Solicitud {
  const db = repository.getState();
  const solicitante = db.empleados.find((e) => e.id === params.empleadoId);

  // Obtener snapshot del turno actual para el registro
  const cuadrante = obtenerMatrizCuadrante(params.empresaId, params.fecha, params.fecha);
  const turnoActualSolicitante = cuadrante.grilla[params.empleadoId]?.[params.fecha]?.turnoOficial;

  let turnoActualDestino: any = undefined;
  if (params.tipo === 'PERMUTA' && params.empleadoDestinoId) {
    const fDestino = params.fechaDestino || params.fecha;
    const cuadranteDest = obtenerMatrizCuadrante(params.empresaId, fDestino, fDestino);
    turnoActualDestino = cuadranteDest.grilla[params.empleadoDestinoId]?.[fDestino]?.turnoOficial;
  }

  const solicitudId = `sol-${Date.now().toString().slice(-6)}`;
  const nuevaSolicitud: Solicitud = {
    id: solicitudId,
    empresaId: params.empresaId,
    empleadoId: params.empleadoId,
    tipo: params.tipo,
    fecha: params.fecha,
    fechaFin: params.fechaFin,
    turnoPropuestoId: params.turnoPropuestoId,
    empleadoDestinoId: params.empleadoDestinoId,
    fechaDestino: params.fechaDestino || params.fecha,
    turnoOriginalSolicitanteId: turnoActualSolicitante?.id,
    turnoOriginalDestinoId: turnoActualDestino?.id,
    motivo: params.motivo,
    estado: 'PENDIENTE',
    fechaCreacion: new Date().toISOString(),
  };

  db.solicitudes.unshift(nuevaSolicitud);

  // Registrar en historial
  const evento: HistorialEvento = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId: params.empresaId,
    tipoEvento: 'SOLICITUD_CREADA',
    empleadoId: params.empleadoId,
    empleadoNombre: solicitante ? `${solicitante.nombre} ${solicitante.apellidos}` : 'Empleado',
    fechaAfectada: params.fecha,
    turnoAnteriorCodigo: turnoActualSolicitante?.codigo,
    turnoNuevoCodigo: params.tipo === 'DIA_LIBRE' ? 'LIB' : undefined,
    motivo: `Solicitud de ${params.tipo}: ${params.motivo}`,
    usuarioNombre: solicitante ? `${solicitante.nombre} ${solicitante.apellidos}` : 'Empleado',
    referenciaId: solicitudId,
    timestamp: new Date().toISOString(),
  };

  db.historial.unshift(evento);
  repository.saveState(db);

  return nuevaSolicitud;
}

export interface ResolverSolicitudParams {
  solicitudId: string;
  autorizadorUsuarioId: string;
  autorizadorNombre: string;
  comentarioResolucion?: string;
}

/**
 * Aprueba una solicitud y aplica de forma atómica los cambios en la planificación oficial.
 */
export function aprobarSolicitud(params: ResolverSolicitudParams): Autorizacion {
  const db = repository.getState();
  const solicitud = db.solicitudes.find((s) => s.id === params.solicitudId);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  if (solicitud.estado !== 'PENDIENTE') {
    throw new Error('La solicitud ya fue procesada anteriormente');
  }

  const empresaId = solicitud.empresaId;
  const autorizacionId = `aut-${Date.now().toString().slice(-6)}`;
  const cambiosAplicados: CambioAplicado[] = [];

  // Calcular turnos actuales previos para trazabilidad exacta
  const solicitante = db.empleados.find((e) => e.id === solicitud.empleadoId);

  // 1. CASO DIA_LIBRE
  if (solicitud.tipo === 'DIA_LIBRE') {
    const turnoLibre = db.turnos.find((t) => t.empresaId === empresaId && t.esLibre) || {
      id: 'trn-lib',
      codigo: 'LIB',
    };

    const cuadrante = obtenerMatrizCuadrante(empresaId, solicitud.fecha, solicitud.fecha);
    const turnoPrevio = cuadrante.grilla[solicitud.empleadoId]?.[solicitud.fecha]?.turnoOficial;

    // Crear/actualizar asignación oficial
    const nuevaAsignacion: Asignacion = {
      id: `asg-aut-${Date.now()}-1`,
      empresaId,
      empleadoId: solicitud.empleadoId,
      fecha: solicitud.fecha,
      turnoId: turnoLibre.id,
      origen: 'MODIFICACION_AUTORIZADA',
      solicitudId: solicitud.id,
      notas: `Aprobado día libre por ${params.autorizadorNombre}`,
      fechaModificacion: new Date().toISOString(),
      modificadoPorUsuarioId: params.autorizadorUsuarioId,
    };

    // Reemplazar si existía
    const existingIdx = db.asignaciones.findIndex(
      (a) => a.empresaId === empresaId && a.empleadoId === solicitud.empleadoId && a.fecha === solicitud.fecha
    );
    if (existingIdx >= 0) {
      db.asignaciones[existingIdx] = nuevaAsignacion;
    } else {
      db.asignaciones.push(nuevaAsignacion);
    }

    cambiosAplicados.push({
      empleadoId: solicitud.empleadoId,
      fecha: solicitud.fecha,
      turnoAnteriorId: turnoPrevio?.id || '',
      turnoNuevoId: turnoLibre.id,
    });
  }

  // 2. CASO CAMBIO_TURNO
  else if (solicitud.tipo === 'CAMBIO_TURNO') {
    if (!solicitud.turnoPropuestoId) {
      throw new Error('No se especificó el turno propuesto');
    }

    const cuadrante = obtenerMatrizCuadrante(empresaId, solicitud.fecha, solicitud.fecha);
    const turnoPrevio = cuadrante.grilla[solicitud.empleadoId]?.[solicitud.fecha]?.turnoOficial;

    const nuevaAsignacion: Asignacion = {
      id: `asg-aut-${Date.now()}-1`,
      empresaId,
      empleadoId: solicitud.empleadoId,
      fecha: solicitud.fecha,
      turnoId: solicitud.turnoPropuestoId,
      origen: 'MODIFICACION_AUTORIZADA',
      solicitudId: solicitud.id,
      notas: `Aprobado cambio de turno por ${params.autorizadorNombre}`,
      fechaModificacion: new Date().toISOString(),
      modificadoPorUsuarioId: params.autorizadorUsuarioId,
    };

    const existingIdx = db.asignaciones.findIndex(
      (a) => a.empresaId === empresaId && a.empleadoId === solicitud.empleadoId && a.fecha === solicitud.fecha
    );
    if (existingIdx >= 0) {
      db.asignaciones[existingIdx] = nuevaAsignacion;
    } else {
      db.asignaciones.push(nuevaAsignacion);
    }

    cambiosAplicados.push({
      empleadoId: solicitud.empleadoId,
      fecha: solicitud.fecha,
      turnoAnteriorId: turnoPrevio?.id || '',
      turnoNuevoId: solicitud.turnoPropuestoId,
    });
  }

  // 3. CASO PERMUTA (INTERCAMBIO ATÓMICO)
  else if (solicitud.tipo === 'PERMUTA') {
    if (!solicitud.empleadoDestinoId) {
      throw new Error('Permuta requiere un empleado destinatario');
    }

    const fechaA = solicitud.fecha;
    const fechaB = solicitud.fechaDestino || solicitud.fecha;

    // Turnos oficiales previos antes del intercambio
    const cA = obtenerMatrizCuadrante(empresaId, fechaA, fechaA);
    const cB = obtenerMatrizCuadrante(empresaId, fechaB, fechaB);

    const turnoA = cA.grilla[solicitud.empleadoId]?.[fechaA]?.turnoOficial;
    const turnoB = cB.grilla[solicitud.empleadoDestinoId]?.[fechaB]?.turnoOficial;

    if (!turnoA || !turnoB) {
      throw new Error('No se pudieron resolver los turnos de ambos empleados para la permuta');
    }

    // OPERACIÓN ATÓMICA: Carlos recibe turnoB, Destinatario recibe turnoA
    const asgA: Asignacion = {
      id: `asg-perm-A-${Date.now()}`,
      empresaId,
      empleadoId: solicitud.empleadoId,
      fecha: fechaA,
      turnoId: turnoB.id,
      origen: 'MODIFICACION_AUTORIZADA',
      solicitudId: solicitud.id,
      notas: `Permuta aprobada con ${solicitud.empleadoDestinoId} por ${params.autorizadorNombre}`,
      fechaModificacion: new Date().toISOString(),
      modificadoPorUsuarioId: params.autorizadorUsuarioId,
    };

    const asgB: Asignacion = {
      id: `asg-perm-B-${Date.now()}`,
      empresaId,
      empleadoId: solicitud.empleadoDestinoId,
      fecha: fechaB,
      turnoId: turnoA.id,
      origen: 'MODIFICACION_AUTORIZADA',
      solicitudId: solicitud.id,
      notas: `Permuta aprobada con ${solicitud.empleadoId} por ${params.autorizadorNombre}`,
      fechaModificacion: new Date().toISOString(),
      modificadoPorUsuarioId: params.autorizadorUsuarioId,
    };

    // Actualizar asignación A
    const idxA = db.asignaciones.findIndex(
      (a) => a.empresaId === empresaId && a.empleadoId === solicitud.empleadoId && a.fecha === fechaA
    );
    if (idxA >= 0) db.asignaciones[idxA] = asgA;
    else db.asignaciones.push(asgA);

    // Actualizar asignación B
    const idxB = db.asignaciones.findIndex(
      (a) => a.empresaId === empresaId && a.empleadoId === solicitud.empleadoDestinoId && a.fecha === fechaB
    );
    if (idxB >= 0) db.asignaciones[idxB] = asgB;
    else db.asignaciones.push(asgB);

    cambiosAplicados.push(
      {
        empleadoId: solicitud.empleadoId,
        fecha: fechaA,
        turnoAnteriorId: turnoA.id,
        turnoNuevoId: turnoB.id,
      },
      {
        empleadoId: solicitud.empleadoDestinoId,
        fecha: fechaB,
        turnoAnteriorId: turnoB.id,
        turnoNuevoId: turnoA.id,
      }
    );
  }

  // 4. CREAR OBJETO AUTORIZACIÓN
  const autorizacion: Autorizacion = {
    id: autorizacionId,
    empresaId,
    solicitudId: solicitud.id,
    autorizadorUsuarioId: params.autorizadorUsuarioId,
    autorizadorNombre: params.autorizadorNombre,
    decision: 'APROBADA',
    comentarioResolucion: params.comentarioResolucion || 'Aprobada sin observaciones',
    fechaDecision: new Date().toISOString(),
    cambiosAplicados,
  };

  solicitud.estado = 'APROBADA';
  solicitud.autorizacionId = autorizacionId;
  db.autorizaciones.push(autorizacion);

  // 5. REGISTRAR EN HISTORIAL
  const evento: HistorialEvento = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId,
    tipoEvento: solicitud.tipo === 'PERMUTA' ? 'PERMUTA_APLICADA' : 'SOLICITUD_APROBADA',
    empleadoId: solicitud.empleadoId,
    empleadoNombre: solicitante ? `${solicitante.nombre} ${solicitante.apellidos}` : 'Empleado',
    fechaAfectada: solicitud.fecha,
    motivo: `Solicitud #${solicitud.id} (${solicitud.tipo}) APROBADA. Motivo resolución: ${params.comentarioResolucion || 'Conforme'}`,
    usuarioNombre: params.autorizadorNombre,
    referenciaId: solicitud.id,
    timestamp: new Date().toISOString(),
  };

  db.historial.unshift(evento);
  repository.saveState(db);

  return autorizacion;
}

/**
 * Rechaza una solicitud.
 * Deja la planificación oficial intacta.
 */
export function rechazarSolicitud(params: ResolverSolicitudParams): Autorizacion {
  const db = repository.getState();
  const solicitud = db.solicitudes.find((s) => s.id === params.solicitudId);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  if (solicitud.estado !== 'PENDIENTE') {
    throw new Error('La solicitud ya fue procesada anteriormente');
  }

  const empresaId = solicitud.empresaId;
  const autorizacionId = `aut-${Date.now().toString().slice(-6)}`;
  const solicitante = db.empleados.find((e) => e.id === solicitud.empleadoId);

  const autorizacion: Autorizacion = {
    id: autorizacionId,
    empresaId,
    solicitudId: solicitud.id,
    autorizadorUsuarioId: params.autorizadorUsuarioId,
    autorizadorNombre: params.autorizadorNombre,
    decision: 'RECHAZADA',
    comentarioResolucion: params.comentarioResolucion || 'Rechazada por necesidades del servicio',
    fechaDecision: new Date().toISOString(),
    cambiosAplicados: [],
  };

  solicitud.estado = 'RECHAZADA';
  solicitud.autorizacionId = autorizacionId;
  db.autorizaciones.push(autorizacion);

  // Registrar en historial
  const evento: HistorialEvento = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId,
    tipoEvento: 'SOLICITUD_RECHAZADA',
    empleadoId: solicitud.empleadoId,
    empleadoNombre: solicitante ? `${solicitante.nombre} ${solicitante.apellidos}` : 'Empleado',
    fechaAfectada: solicitud.fecha,
    motivo: `Solicitud #${solicitud.id} RECHAZADA. Motivo: ${params.comentarioResolucion || 'No viable por cobertura'}`,
    usuarioNombre: params.autorizadorNombre,
    referenciaId: solicitud.id,
    timestamp: new Date().toISOString(),
  };

  db.historial.unshift(evento);
  repository.saveState(db);

  return autorizacion;
}

/**
 * Cancela una solicitud pendiente por parte del empleado.
 */
export function cancelarSolicitud(solicitudId: string): void {
  const db = repository.getState();
  const sol = db.solicitudes.find((s) => s.id === solicitudId);
  if (sol && sol.estado === 'PENDIENTE') {
    sol.estado = 'CANCELADA';
    repository.saveState(db);
  }
}
