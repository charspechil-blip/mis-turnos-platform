import { repository } from '../data/storage.ts';
import {
  Empleado,
  Grupo,
  Turno,
  ReglaRotacion,
  Empresa,
  ModalidadEmpleado,
  EstadoEmpleado,
  PasoRotacion,
} from '../domain/types.ts';

// EMPLEADOS
export function guardarEmpleado(
  empleado: Omit<Empleado, 'id' | 'fechaAlta'> & { id?: string }
): Empleado {
  const db = repository.getState();
  const id = empleado.id || `emp-${Date.now().toString().slice(-6)}`;

  const existingIdx = db.empleados.findIndex((e) => e.id === id);
  const empGuardado: Empleado = {
    ...empleado,
    id,
    fechaAlta: existingIdx >= 0 ? db.empleados[existingIdx].fechaAlta : new Date().toISOString().slice(0, 10),
  };

  if (existingIdx >= 0) {
    db.empleados[existingIdx] = empGuardado;
  } else {
    db.empleados.push(empGuardado);
  }

  repository.saveState(db);
  return empGuardado;
}

export function cambiarEstadoEmpleado(empleadoId: string, nuevoEstado: EstadoEmpleado): void {
  const db = repository.getState();
  const emp = db.empleados.find((e) => e.id === empleadoId);
  if (emp) {
    emp.estado = nuevoEstado;
    repository.saveState(db);
  }
}

// GRUPOS
export function guardarGrupo(
  grupo: Omit<Grupo, 'id'> & { id?: string }
): Grupo {
  const db = repository.getState();
  const id = grupo.id || `grp-${Date.now().toString().slice(-6)}`;

  const existingIdx = db.grupos.findIndex((g) => g.id === id);
  const grupoGuardado: Grupo = {
    ...grupo,
    id,
  };

  if (existingIdx >= 0) {
    db.grupos[existingIdx] = grupoGuardado;
  } else {
    db.grupos.push(grupoGuardado);
  }

  repository.saveState(db);
  return grupoGuardado;
}

export function eliminarGrupo(grupoId: string): void {
  const db = repository.getState();
  // Desvincular empleados de este grupo
  db.empleados.forEach((e) => {
    if (e.grupoId === grupoId) {
      e.grupoId = undefined;
    }
  });
  db.grupos = db.grupos.filter((g) => g.id !== grupoId);
  repository.saveState(db);
}

// TURNOS
export function guardarTurno(
  turno: Omit<Turno, 'id'> & { id?: string }
): Turno {
  const db = repository.getState();
  const id = turno.id || `trn-${Date.now().toString().slice(-6)}`;

  const existingIdx = db.turnos.findIndex((t) => t.id === id);
  const turnoGuardado: Turno = {
    ...turno,
    id,
  };

  if (existingIdx >= 0) {
    db.turnos[existingIdx] = turnoGuardado;
  } else {
    db.turnos.push(turnoGuardado);
  }

  repository.saveState(db);
  return turnoGuardado;
}

// REGLAS DE ROTACIÓN
export function guardarReglaRotacion(
  regla: Omit<ReglaRotacion, 'id'> & { id?: string }
): ReglaRotacion {
  const db = repository.getState();
  const id = regla.id || `reg-${Date.now().toString().slice(-6)}`;

  const existingIdx = db.reglasRotacion.findIndex((r) => r.id === id);
  const reglaGuardada: ReglaRotacion = {
    ...regla,
    id,
  };

  if (existingIdx >= 0) {
    db.reglasRotacion[existingIdx] = reglaGuardada;
  } else {
    db.reglasRotacion.push(reglaGuardada);
  }

  repository.saveState(db);
  return reglaGuardada;
}

// EMPRESAS
export function crearEmpresa(nombre: string, identificadorFiscal?: string, sector?: string): Empresa {
  const db = repository.getState();
  const nuevaEmpresa: Empresa = {
    id: `emp-${Date.now().toString().slice(-6)}`,
    nombre,
    identificadorFiscal,
    sector,
    fechaCreacion: new Date().toISOString().slice(0, 10),
  };

  db.empresas.push(nuevaEmpresa);

  // Crear turno Libre básico por defecto para esta nueva empresa
  const turnoLibre: Turno = {
    id: `trn-lib-${nuevaEmpresa.id}`,
    empresaId: nuevaEmpresa.id,
    codigo: 'LIB',
    nombre: 'Descanso / Libre',
    esLibre: true,
    horasComputables: 0,
    colorHex: '#64748b',
    descripcion: 'Día de libranza',
  };
  db.turnos.push(turnoLibre);

  repository.saveState(db);
  return nuevaEmpresa;
}
