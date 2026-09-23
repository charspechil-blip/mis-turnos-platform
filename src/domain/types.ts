/**
 * MIS TURNOS — Entidades del Dominio
 * Estructuras de datos puras e independientes de la base de datos o framework.
 */

export interface Empresa {
  id: string;
  nombre: string;
  identificadorFiscal?: string;
  sector?: string;
  fechaCreacion: string;
}

export type RolUsuario = 'GESTOR' | 'EMPLEADO' | 'AUTORIZADOR';

export interface Usuario {
  id: string;
  empresaId: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  empleadoId?: string; // Vinculación opcional con una ficha de empleado
}

export type ModalidadEmpleado = 'FIJO' | 'ROTATIVO';
export type EstadoEmpleado = 'ACTIVO' | 'INACTIVO' | 'BAJA';

export interface Empleado {
  id: string;
  empresaId: string;
  nombre: string;
  apellidos: string;
  identificacionInterna: string; // Legajo, DNI o código de nómina
  estado: EstadoEmpleado;
  modalidadTrabajo: ModalidadEmpleado;
  grupoId?: string;
  usuarioAsociadoId?: string; // Puede no tener acceso al sistema
  // Para empleados fijos: turno por defecto para días laborables
  turnoFijoPredeterminadoId?: string;
  // Días de descanso habituales para empleados fijos (0=Domingo, 1=Lunes, ..., 6=Sábado)
  diasDescansoFijo?: number[];
  fechaAlta: string;
  puesto?: string;
}

export interface Grupo {
  id: string;
  empresaId: string;
  nombre: string;
  descripcion?: string;
  colorIdentificador?: string;
  reglaRotacionId?: string; // Regla de rotación si el grupo es rotativo
  fechaInicioRotacion?: string; // Fecha de anclaje (YYYY-MM-DD) para el día 1 del ciclo
  desfaseDias?: number; // Días de desfase respecto al inicio de la regla
}

export interface Turno {
  id: string;
  empresaId: string;
  codigo: string; // ej: "T1", "T2", "T3", "NOC", "LIB"
  nombre: string; // ej: "Mañana", "Tarde", "Noche", "Descanso Libre"
  esLibre: boolean; // Verdadero si corresponde a descanso/libre
  horaInicio?: string; // ej: "06:00"
  horaFin?: string; // ej: "14:00"
  horasComputables: number; // ej: 8, 7.5, 0 para libre
  colorHex: string; // ej: "#2563eb"
  descripcion?: string;
}

export interface PasoRotacion {
  diaCiclo: number; // 1 hasta N (longitud del ciclo)
  turnoId: string;
}

export interface ReglaRotacion {
  id: string;
  empresaId: string;
  nombre: string; // ej: "Ciclo 6x2 Continuo", "Ciclo 5x2 Oficina"
  descripcion?: string;
  longitudDias: number; // Longitud del ciclo (ej: 8 días para 6 trabajo + 2 libre)
  pasos: PasoRotacion[];
}

export type OrigenAsignacion =
  | 'ROTACION'
  | 'MANUAL'
  | 'IMPORTACION'
  | 'MODIFICACION_AUTORIZADA';

export interface Asignacion {
  id: string;
  empresaId: string;
  empleadoId: string;
  fecha: string; // YYYY-MM-DD
  turnoId: string;
  origen: OrigenAsignacion;
  notas?: string;
  solicitudId?: string; // Si proviene de una solicitud aprobada
  fechaModificacion?: string;
  modificadoPorUsuarioId?: string;
}

export type TipoExcepcion =
  | 'VACACIONES'
  | 'LICENCIA'
  | 'BAJA_MEDICA'
  | 'AUSENCIA_JUSTIFICADA'
  | 'MODIFICACION_TEMPORAL'
  | 'OTRO';

export type EstadoExcepcion = 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';

export interface Excepcion {
  id: string;
  empresaId: string;
  empleadoId: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  tipo: TipoExcepcion;
  turnoReemplazoId?: string; // Turno asignado durante la excepción (o descanso/libre)
  motivo: string;
  estado: EstadoExcepcion;
  fechaRegistro: string;
  registradoPorUsuarioId?: string;
}

export type TipoSolicitud =
  | 'DIA_LIBRE'
  | 'CAMBIO_TURNO'
  | 'PERMUTA'
  | 'MODIFICACION_HORARIA';

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

export interface Solicitud {
  id: string;
  empresaId: string;
  empleadoId: string; // Empleado solicitante
  tipo: TipoSolicitud;
  fecha: string; // Fecha afectada (YYYY-MM-DD)
  fechaFin?: string; // Rango opcional
  turnoPropuestoId?: string; // Para CAMBIO_TURNO o DIA_LIBRE (el turno 'Libre')
  // Para PERMUTAS:
  empleadoDestinoId?: string; // Compañero con quien se permuta
  fechaDestino?: string; // Fecha del compañero (suele ser la misma fecha o una compensatoria)
  // Snapshots de contexto en el momento de solicitar:
  turnoOriginalSolicitanteId?: string;
  turnoOriginalDestinoId?: string;
  motivo: string;
  estado: EstadoSolicitud;
  fechaCreacion: string;
  // Resolución
  autorizacionId?: string;
}

export interface CambioAplicado {
  empleadoId: string;
  fecha: string;
  turnoAnteriorId: string;
  turnoNuevoId: string;
}

export interface Autorizacion {
  id: string;
  empresaId: string;
  solicitudId: string;
  autorizadorUsuarioId: string;
  autorizadorNombre: string;
  decision: 'APROBADA' | 'RECHAZADA';
  comentarioResolucion?: string;
  fechaDecision: string;
  cambiosAplicados?: CambioAplicado[];
}

export type TipoEventoHistorial =
  | 'ASIGNACION_CREADA'
  | 'ASIGNACION_MODIFICADA'
  | 'SOLICITUD_CREADA'
  | 'SOLICITUD_APROBADA'
  | 'SOLICITUD_RECHAZADA'
  | 'PERMUTA_APLICADA'
  | 'EXCEPCION_REGISTRADA'
  | 'IMPORTACION_EXCEL';

export interface HistorialEvento {
  id: string;
  empresaId: string;
  tipoEvento: TipoEventoHistorial;
  empleadoId?: string;
  empleadoNombre?: string;
  fechaAfectada?: string;
  turnoAnteriorCodigo?: string;
  turnoNuevoCodigo?: string;
  motivo: string;
  usuarioNombre: string;
  referenciaId?: string; // ej: Solicitud #ID
  timestamp: string;
}

/**
 * Modelo resuelto para un Empleado en una Fecha concreta.
 * Distingue inequívocamente:
 * 1. Planificación base (rotación o fija)
 * 2. Solicitud activa (si la hay)
 * 3. Excepción (si la hay)
 * 4. Resultado Oficial definitivo
 */
export interface TurnoOficialDia {
  fecha: string; // YYYY-MM-DD
  empleadoId: string;
  // Lo que la regla o planificación inicial determinó
  turnoPlanificado?: Turno;
  origenPlanificado?: OrigenAsignacion;
  // Si existe una solicitud en curso pendiente
  solicitudPendiente?: Solicitud;
  // Si existe una excepción que aplica
  excepcionActiva?: Excepcion;
  // El turno que FINALMENTE corresponde al empleado (RESULTADO OFICIAL)
  turnoOficial: Turno;
  origenOficial: OrigenAsignacion | 'EXCEPCION';
  // Si fue producto de una autorización
  autorizacion?: Autorizacion;
  esModificadoOficial: boolean; // Indica si difiere de la regla de rotación/planificación base
}
