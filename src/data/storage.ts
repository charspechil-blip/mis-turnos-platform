import { DatabaseState, initialDatabase } from './mockDatabase.ts';

const STORAGE_KEY = 'mis_turnos_database_v1';

export class DatabaseRepository {
  private static instance: DatabaseRepository;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): DatabaseRepository {
    if (!DatabaseRepository.instance) {
      DatabaseRepository.instance = new DatabaseRepository();
    }
    return DatabaseRepository.instance;
  }

  private ensureInitialized(): void {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        this.saveState(initialDatabase);
      }
    } catch (e) {
      console.warn('LocalStorage no disponible o bloqueado, usando memoria volátil:', e);
    }
  }

  public getState(): DatabaseState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as DatabaseState;
      }
    } catch (e) {
      console.error('Error al leer de localStorage:', e);
    }
    return initialDatabase;
  }

  public saveState(state: DatabaseState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  }

  public resetToDefault(): DatabaseState {
    this.saveState(initialDatabase);
    return initialDatabase;
  }
}

export const repository = DatabaseRepository.getInstance();
