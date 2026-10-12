import type { WorkoutSet } from '../types'

/** 1RM estimado con la fórmula de Epley. Con 1 rep es el mismo peso; con 0 reps no hay estimación. */
export function epley(peso: number, reps: number): number {
  if (reps <= 0 || peso <= 0) return 0
  if (reps === 1) return peso
  return peso * (1 + reps / 30)
}

/** Suma de peso × reps de las series completadas. */
export function volumen(sets: WorkoutSet[]): number {
  return sets.reduce((total, s) => (s.completada ? total + s.peso * s.reps : total), 0)
}

export function pesoMaximo(sets: WorkoutSet[]): number {
  return sets.reduce((max, s) => (s.completada && s.peso > max ? s.peso : max), 0)
}

export function mejor1RM(sets: WorkoutSet[]): number {
  return sets.reduce((max, s) => (s.completada ? Math.max(max, epley(s.peso, s.reps)) : max), 0)
}

/** Lunes 00:00 (hora local) de la semana de `fecha`. En Chile la semana parte el lunes. */
export function inicioSemana(fecha: number | Date): Date {
  const d = new Date(fecha)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

export function claveDia(fecha: number | Date): string {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/**
 * Semanas seguidas con al menos un entreno, contando hacia atrás desde esta semana.
 * Si esta semana todavía no entrenas, la racha se cuenta desde la semana pasada (aún puedes mantenerla).
 */
export function rachaSemanal(fechas: number[], ahora = Date.now()): number {
  const semanas = new Set(fechas.map((f) => inicioSemana(f).getTime()))
  const semana = inicioSemana(ahora)
  if (!semanas.has(semana.getTime())) semana.setDate(semana.getDate() - 7)
  let racha = 0
  while (semanas.has(semana.getTime())) {
    racha++
    semana.setDate(semana.getDate() - 7)
  }
  return racha
}

export function mejorRachaSemanal(fechas: number[]): number {
  const semanas = [...new Set(fechas.map((f) => inicioSemana(f).getTime()))].sort((a, b) => a - b)
  let mejor = 0
  let actual = 0
  semanas.forEach((t, i) => {
    // +8 días y volver al lunes: evita errores por cambio de horario.
    const consecutiva = i > 0 && inicioSemana(semanas[i - 1] + 8 * 86_400_000).getTime() === t
    actual = consecutiva ? actual + 1 : 1
    mejor = Math.max(mejor, actual)
  })
  return mejor
}
