import { repository } from '../data/storage.ts';
import { Excepcion, TipoExcepcion, HistorialEvento } from '../domain/types.ts';

export interface RegistrarExcepcionParams {
  empresaId: string;
  empleadoId: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoExcepcion;
  turnoReemplazoId?: string;
  motivo: string;
  usuarioNombre: string;
}

export function registrarExcepcion(params: RegistrarExcepcionParams): Excepcion {
  if (params.fechaInicio > params.fechaFin) {
    throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
  }

  const db = repository.getState();
  const emp = db.empleados.find((e) => e.id === params.empleadoId);

  const nuevaExcepcion: Excepcion = {
    id: `exc-${Date.now().toString().slice(-6)}`,
    empresaId: params.empresaId,
    empleadoId: params.empleadoId,
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    tipo: params.tipo,
    turnoReemplazoId: params.turnoReemplazoId,
    motivo: params.motivo,
    estado: 'ACTIVA',
    fechaRegistro: new Date().toISOString(),
  };

  db.excepciones.push(nuevaExcepcion);

  // Historial
  const evento: HistorialEvento = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId: params.empresaId,
    tipoEvento: 'EXCEPCION_REGISTRADA',
    empleadoId: params.empleadoId,
    empleadoNombre: emp ? `${emp.nombre} ${emp.apellidos}` : 'Empleado',
    fechaAfectada: `${params.fechaInicio} a ${params.fechaFin}`,
    motivo: `Registro de excepción (${params.tipo}): ${params.motivo}`,
    usuarioNombre: params.usuarioNombre,
    referenciaId: nuevaExcepcion.id,
    timestamp: new Date().toISOString(),
  };

  db.historial.unshift(evento);
  repository.saveState(db);

  return nuevaExcepcion;
}

export function cancelarExcepcion(excepcionId: string, usuarioNombre: string = 'Gestor'): void {
  const db = repository.getState();
  const exc = db.excepciones.find((e) => e.id === excepcionId);
  if (!exc) return;

  exc.estado = 'CANCELADA';
  const emp = db.empleados.find((e) => e.id === exc.empleadoId);

  const evento: HistorialEvento = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId: exc.empresaId,
    tipoEvento: 'ASIGNACION_MODIFICADA',
    empleadoId: exc.empleadoId,
    empleadoNombre: emp ? `${emp.nombre} ${emp.apellidos}` : 'Empleado',
    fechaAfectada: `${exc.fechaInicio} a ${exc.fechaFin}`,
    motivo: `Cancelación de excepción ${exc.tipo}: ${exc.motivo}`,
    usuarioNombre,
    referenciaId: exc.id,
    timestamp: new Date().toISOString(),
  };

  db.historial.unshift(evento);
  repository.saveState(db);
}
