import { ReglaRotacion, Turno } from '../types.ts';

/**
 * Normaliza una fecha ISO (YYYY-MM-DD) a medianoche UTC
 * para evitar discrepancias por zonas horarias o cambios de hora estival.
 */
export function parseDateOnly(dateString: string): Date {
  const parts = dateString.split('-').map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

/**
 * Convierte un objeto Date a string YYYY-MM-DD
 */
export function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula la diferencia en días enteros entre dos fechas YYYY-MM-DD
 */
export function daysBetween(startDateStr: string, targetDateStr: string): number {
  const start = parseDateOnly(startDateStr);
  const target = parseDateOnly(targetDateStr);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - start.getTime()) / msPerDay);
}

/**
 * Calcula el turno que corresponde a una regla de rotación en una fecha concreta.
 *
 * @param regla Regla de rotación definida con longitud de ciclo y pasos.
 * @param fechaInicio Fecha de anclaje que corresponde al día 1 del ciclo (YYYY-MM-DD).
 * @param fechaObjetivo Fecha para la cual se desea calcular el turno (YYYY-MM-DD).
 * @param desfase Días adicionales de desfase (offset) para este grupo o empleado.
 * @param turnosMap Mapa o catálogo de turnos indexado por ID.
 * @returns El turno correspondiente y el número de paso dentro del ciclo (1..N), o null si no se puede determinar.
 */
export function calculateRotationShift(
  regla: ReglaRotacion,
  fechaInicio: string,
  fechaObjetivo: string,
  desfase: number = 0,
  turnosMap: Record<string, Turno>
): { turno: Turno; diaCiclo: number } | null {
  if (!regla || !regla.pasos || regla.pasos.length === 0 || regla.longitudDias <= 0) {
    return null;
  }

  const rawDiff = daysBetween(fechaInicio, fechaObjetivo) + (desfase || 0);
  const cycleLength = regla.longitudDias;

  // Manejo de módulo para números negativos y positivos en ciclo 1..N
  const remainder = ((rawDiff % cycleLength) + cycleLength) % cycleLength;
  const diaCiclo = remainder + 1; // 1-indexed

  // Buscar paso correspondiente en la regla
  const paso = regla.pasos.find((p) => p.diaCiclo === diaCiclo);
  if (!paso) {
    // Si no está explícito, buscar si hay turno por defecto o el primer turno disponible
    return null;
  }

  const turno = turnosMap[paso.turnoId];
  if (!turno) {
    return null;
  }

  return { turno, diaCiclo };
}
