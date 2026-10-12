import { inicioSemana, mejor1RM, pesoMaximo, volumen } from './calculos'
import type { Routine, Workout, WorkoutSet } from '../types'

/**
 * Logros (medallas) calculados desde el historial: no se guardan, así que funcionan también con entrenos antiguos
 * y se mantienen al importar un respaldo. Cada logro sabe cuándo se desbloqueó (en qué entreno).
 */

export type Categoria = 'entrenos' | 'racha' | 'records' | 'volumen' | 'plan' | 'cumplidos'

export interface Logro {
  id: string
  categoria: Categoria
  titulo: string
  descripcion: string
  meta: number
  progreso: number
  /** Fecha y entreno en que se cumplió. `null` si todavía no. */
  desbloqueado: { fecha: number; workoutId: number } | null
}

interface Definicion {
  id: string
  categoria: Categoria
  titulo: string
  descripcion: string
  meta: number
}

const DEFINICIONES: Definicion[] = [
  { id: 'entrenos-1', categoria: 'entrenos', titulo: 'Primer paso', descripcion: 'Termina tu primer entreno.', meta: 1 },
  { id: 'entrenos-5', categoria: 'entrenos', titulo: 'Constancia', descripcion: 'Termina 5 entrenos.', meta: 5 },
  { id: 'entrenos-10', categoria: 'entrenos', titulo: 'Hábito', descripcion: 'Termina 10 entrenos.', meta: 10 },
  { id: 'entrenos-25', categoria: 'entrenos', titulo: 'Disciplina', descripcion: 'Termina 25 entrenos.', meta: 25 },
  { id: 'entrenos-50', categoria: 'entrenos', titulo: 'Imparable', descripcion: 'Termina 50 entrenos.', meta: 50 },
  { id: 'entrenos-100', categoria: 'entrenos', titulo: 'Leyenda', descripcion: 'Termina 100 entrenos.', meta: 100 },
  { id: 'racha-2', categoria: 'racha', titulo: 'Dos semanas', descripcion: 'Entrena 2 semanas seguidas.', meta: 2 },
  { id: 'racha-4', categoria: 'racha', titulo: 'Un mes firme', descripcion: 'Entrena 4 semanas seguidas.', meta: 4 },
  { id: 'racha-8', categoria: 'racha', titulo: 'Dos meses', descripcion: 'Entrena 8 semanas seguidas.', meta: 8 },
  { id: 'racha-12', categoria: 'racha', titulo: 'Tres meses', descripcion: 'Entrena 12 semanas seguidas.', meta: 12 },
  { id: 'records-1', categoria: 'records', titulo: 'Primer récord', descripcion: 'Supera tu mejor marca en un ejercicio.', meta: 1 },
  { id: 'records-10', categoria: 'records', titulo: 'Coleccionista', descripcion: 'Rompe 10 récords.', meta: 10 },
  { id: 'records-50', categoria: 'records', titulo: 'Máquina de récords', descripcion: 'Rompe 50 récords.', meta: 50 },
  { id: 'volumen-10', categoria: 'volumen', titulo: '10 toneladas', descripcion: 'Levanta 10.000 kg en total.', meta: 10_000 },
  { id: 'volumen-50', categoria: 'volumen', titulo: '50 toneladas', descripcion: 'Levanta 50.000 kg en total.', meta: 50_000 },
  { id: 'volumen-100', categoria: 'volumen', titulo: '100 toneladas', descripcion: 'Levanta 100.000 kg en total.', meta: 100_000 },
  { id: 'volumen-500', categoria: 'volumen', titulo: '500 toneladas', descripcion: 'Levanta 500.000 kg en total.', meta: 500_000 },
  { id: 'plan-1', categoria: 'plan', titulo: 'Semana completa', descripcion: 'Cumple todos los días de tu plan en una semana.', meta: 1 },
  { id: 'plan-4', categoria: 'plan', titulo: 'Plan al pie de la letra', descripcion: 'Completa tu plan en 4 semanas distintas.', meta: 4 },
  { id: 'cumplidos-1', categoria: 'cumplidos', titulo: 'Día cumplido', descripcion: 'Completa todas las series de una rutina.', meta: 1 },
  { id: 'cumplidos-10', categoria: 'cumplidos', titulo: 'Sin excusas', descripcion: 'Completa todas las series de una rutina 10 veces.', meta: 10 },
  { id: 'cumplidos-30', categoria: 'cumplidos', titulo: 'Máquina', descripcion: 'Completa todas las series de una rutina 30 veces.', meta: 30 },
]

/** Entrenos terminados en orden y sus series completadas. */
export function ordenarEntrenos(workouts: Workout[], sets: WorkoutSet[]) {
  const ordenados = workouts.filter((w) => w.fechaFin !== undefined).sort((a, b) => a.fechaInicio - b.fechaInicio)
  const porWorkout = new Map<number, WorkoutSet[]>()
  for (const s of sets) if (s.completada) porWorkout.set(s.workoutId, [...(porWorkout.get(s.workoutId) ?? []), s])
  return { ordenados, porWorkout }
}

/**
 * Récords de cada entreno, igual que recordsDelEntreno: un ejercicio es récord si supera el peso máximo o el 1RM de
 * los entrenos anteriores (la primera vez que haces un ejercicio no cuenta).
 */
export function recordsPorEntreno(ordenados: Workout[], porWorkout: Map<number, WorkoutSet[]>): Map<number, number> {
  const mejores = new Map<number, { peso: number; rm: number }>()
  const resultado = new Map<number, number>()
  for (const w of ordenados) {
    const propios = porWorkout.get(w.id!) ?? []
    let records = 0
    for (const exerciseId of new Set(propios.map((s) => s.exerciseId))) {
      const hoy = propios.filter((s) => s.exerciseId === exerciseId)
      const actual = { peso: pesoMaximo(hoy), rm: mejor1RM(hoy) }
      const antes = mejores.get(exerciseId)
      if (antes && (actual.peso > antes.peso || actual.rm > antes.rm + 0.01)) records++
      mejores.set(exerciseId, { peso: Math.max(actual.peso, antes?.peso ?? 0), rm: Math.max(actual.rm, antes?.rm ?? 0) })
    }
    resultado.set(w.id!, records)
  }
  return resultado
}

/** Completó todas las series objetivo de cada ejercicio de su rutina (con la rutina como está hoy). */
export function diaCumplido(w: Workout, series: WorkoutSet[], rutinas: Map<number, Routine>): boolean {
  const rutina = w.routineId !== undefined ? rutinas.get(w.routineId) : undefined
  if (!rutina || rutina.ejercicios.length === 0) return false
  return rutina.ejercicios.every((e) => series.filter((s) => s.exerciseId === e.exerciseId).length >= e.seriesObjetivo)
}

/**
 * @param workouts entrenos terminados (cualquier orden)
 * @param sets series de esos entrenos
 * @param diasPlan días por semana del plan (0 si no hay plan): para "Semana completa"
 * @param rutinasPlan ids de las rutinas del plan
 * @param rutinas todas las rutinas: para "Día cumplido"
 */
export function calcularLogros(workouts: Workout[], sets: WorkoutSet[], diasPlan = 0, rutinasPlan: number[] = [], rutinas: Routine[] = []): Logro[] {
  const { ordenados, porWorkout } = ordenarEntrenos(workouts, sets)
  const records = recordsPorEntreno(ordenados, porWorkout)
  const porRutina = new Map(rutinas.map((r) => [r.id!, r]))

  const valor: Record<Categoria, number> = { entrenos: 0, racha: 0, records: 0, volumen: 0, plan: 0, cumplidos: 0 }
  const desbloqueos = new Map<string, { fecha: number; workoutId: number }>()
  const semanas = new Set<number>()
  const planPorSemana = new Map<number, Set<number>>()
  const semanasPlanCompletas = new Set<number>()

  for (const w of ordenados) {
    const propios = porWorkout.get(w.id!) ?? []
    valor.entrenos++
    valor.volumen += volumen(propios)

    valor.records += records.get(w.id!) ?? 0
    if (diaCumplido(w, propios, porRutina)) valor.cumplidos++

    // Racha: semanas seguidas terminando en la semana de este entreno.
    const semana = inicioSemana(w.fechaInicio).getTime()
    semanas.add(semana)
    let racha = 0
    for (let s = new Date(semana); semanas.has(s.getTime()); s.setDate(s.getDate() - 7)) racha++
    valor.racha = Math.max(valor.racha, racha)

    if (diasPlan > 0 && w.routineId !== undefined && rutinasPlan.includes(w.routineId)) {
      const dias = planPorSemana.get(semana) ?? new Set<number>()
      dias.add(w.routineId)
      planPorSemana.set(semana, dias)
      if (dias.size >= Math.min(diasPlan, rutinasPlan.length)) semanasPlanCompletas.add(semana)
      valor.plan = semanasPlanCompletas.size
    }

    for (const d of DEFINICIONES) {
      if (!desbloqueos.has(d.id) && valor[d.categoria] >= d.meta) desbloqueos.set(d.id, { fecha: w.fechaInicio, workoutId: w.id! })
    }
  }

  return DEFINICIONES.filter((d) => d.categoria !== 'plan' || diasPlan > 0).map((d) => ({
    ...d,
    progreso: Math.min(valor[d.categoria], d.meta),
    desbloqueado: desbloqueos.get(d.id) ?? null,
  }))
}

/** Cosas para comparar el peso total levantado en un entreno ("levantaste más que un auto"). */
const EQUIVALENCIAS: [number, string][] = [
  [100, 'una lavadora'],
  [300, 'un piano'],
  [700, 'un caballo'],
  [1_200, 'un auto'],
  [3_000, 'una camioneta'],
  [5_000, 'un elefante'],
  [10_000, 'una micro'],
]

export function equivalencia(kg: number): string | null {
  const cosa = [...EQUIVALENCIAS].reverse().find(([peso]) => kg >= peso)
  return cosa ? cosa[1] : null
}

/** Mensaje para la meta semanal según cuántos entrenos lleva. */
export function mensajeSemana(hechos: number, meta: number, diaSemana: number): string {
  if (hechos >= meta) return hechos > meta ? '¡Superaste tu meta de la semana! Vas con todo.' : '¡Meta de la semana cumplida! Así se hace.'
  const faltan = meta - hechos
  const quedanDias = 7 - diaSemana // diaSemana: 0 = lunes … 6 = domingo
  if (hechos === 0)
    return diaSemana === 0 ? 'Semana nueva: parte hoy y marca el ritmo.' : 'Todavía no entrenas esta semana. ¡Hoy es un buen día para partir!'
  if (faltan > quedanDias)
    return `Te faltan ${faltan} y quedan ${quedanDias} ${quedanDias === 1 ? 'día' : 'días'}. Haz lo que puedas: cada entreno suma.`
  return `Vas bien: te ${faltan === 1 ? 'falta 1 entreno' : `faltan ${faltan} entrenos`} para cumplir tu meta.`
}
