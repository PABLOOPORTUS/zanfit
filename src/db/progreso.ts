import { db } from '.'
import { epley, mejor1RM, pesoMaximo, volumen } from '../lib/calculos'
import { compararNombres } from '../lib/texto'
import type { Exercise, Workout, WorkoutSet } from '../types'
import { recordsDelEntreno, type RecordPersonal } from './workouts'
import { esCardio } from '../lib/cardio'

export interface BloqueEjercicio {
  exercise: Exercise
  sets: WorkoutSet[]
}

/** Agrupa series por ejercicio, en el orden en que se agregaron al entreno (id de su primera serie). */
export async function agruparPorEjercicio(sets: WorkoutSet[]): Promise<BloqueEjercicio[]> {
  const porEjercicio = new Map<number, WorkoutSet[]>()
  for (const s of [...sets].sort((a, b) => a.id! - b.id!)) {
    porEjercicio.set(s.exerciseId, [...(porEjercicio.get(s.exerciseId) ?? []), s])
  }
  const exercises = await db.exercises.bulkGet([...porEjercicio.keys()])
  return exercises.flatMap((exercise) =>
    exercise ? [{ exercise, sets: porEjercicio.get(exercise.id!)!.sort((a, b) => a.numeroSerie - b.numeroSerie) }] : [],
  )
}

export interface ResumenEntreno {
  workout: Workout
  duracionMs: number
  volumen: number
  series: number
  bloques: BloqueEjercicio[]
  records: (RecordPersonal & { nombre: string })[]
}

export async function resumenEntreno(id: number): Promise<ResumenEntreno | null> {
  const workout = await db.workouts.get(id)
  if (!workout) return null
  const sets = (await db.sets.where('workoutId').equals(id).toArray()).filter((s) => s.completada)
  const bloques = await agruparPorEjercicio(sets)
  const nombres = new Map(bloques.map((b) => [b.exercise.id!, b.exercise.nombre]))
  const records = (await recordsDelEntreno(id)).map((r) => ({ ...r, nombre: nombres.get(r.exerciseId) ?? '' }))
  return {
    workout,
    duracionMs: (workout.fechaFin ?? Date.now()) - workout.fechaInicio,
    volumen: volumen(sets),
    series: sets.length,
    bloques,
    records,
  }
}

export interface FilaHistorial {
  workout: Workout
  duracionMs: number
  volumen: number
  series: number
  ejercicios: number
}

/** Entrenos terminados, del más reciente al más antiguo. */
export async function historial(): Promise<FilaHistorial[]> {
  const workouts = (await db.workouts.orderBy('fechaInicio').reverse().toArray()).filter((w) => w.fechaFin !== undefined)
  const sets = await db.sets.toArray()
  const porWorkout = new Map<number, WorkoutSet[]>()
  for (const s of sets) if (s.completada) porWorkout.set(s.workoutId, [...(porWorkout.get(s.workoutId) ?? []), s])
  return workouts.map((workout) => {
    const propios = porWorkout.get(workout.id!) ?? []
    return {
      workout,
      duracionMs: workout.fechaFin! - workout.fechaInicio,
      volumen: volumen(propios),
      series: propios.length,
      ejercicios: new Set(propios.map((s) => s.exerciseId)).size,
    }
  })
}

/** Series completadas de entrenos terminados, junto con su entreno. */
async function seriesTerminadas(exerciseId?: number) {
  const terminados = new Map((await db.workouts.toArray()).filter((w) => w.fechaFin !== undefined).map((w) => [w.id!, w]))
  const sets = exerciseId === undefined ? await db.sets.toArray() : await db.sets.where('exerciseId').equals(exerciseId).toArray()
  return { terminados, sets: sets.filter((s) => s.completada && terminados.has(s.workoutId)) }
}

export interface RecordEjercicio {
  exercise: Exercise
  pesoMaximo: number
  /** Reps de la serie con el peso máximo (la mejor si hubo varias con ese peso). */
  repsPesoMaximo: number
  fechaPesoMaximo: number
  mejor1RM: number
  ultimaVez: number
}

/** Récords personales de cada ejercicio con al menos una serie completada, ordenados por nombre. */
export async function recordsPorEjercicio(): Promise<RecordEjercicio[]> {
  const { terminados, sets } = await seriesTerminadas()
  const porEjercicio = new Map<number, WorkoutSet[]>()
  for (const s of sets) porEjercicio.set(s.exerciseId, [...(porEjercicio.get(s.exerciseId) ?? []), s])
  const exercises = await db.exercises.bulkGet([...porEjercicio.keys()])
  return exercises
    .flatMap((exercise) => {
      if (!exercise || esCardio(exercise)) return [] // el cardio no tiene peso ni récords
      const propios = porEjercicio.get(exercise.id!)!
      const top = propios.reduce((a, b) => (b.peso > a.peso || (b.peso === a.peso && b.reps > a.reps) ? b : a))
      return [
        {
          exercise,
          pesoMaximo: top.peso,
          repsPesoMaximo: top.reps,
          fechaPesoMaximo: terminados.get(top.workoutId)!.fechaInicio,
          mejor1RM: mejor1RM(propios),
          ultimaVez: Math.max(...propios.map((s) => terminados.get(s.workoutId)!.fechaInicio)),
        },
      ]
    })
    .sort((a, b) => compararNombres(a.exercise.nombre, b.exercise.nombre))
}

export interface PuntoProgreso {
  workoutId: number
  fecha: number
  pesoMaximo: number
  volumen: number
  mejor1RM: number
}

/** Un punto por entreno terminado en que se hizo el ejercicio, en orden cronológico. */
export async function progresoEjercicio(exerciseId: number): Promise<PuntoProgreso[]> {
  const { terminados, sets } = await seriesTerminadas(exerciseId)
  const porWorkout = new Map<number, WorkoutSet[]>()
  for (const s of sets) porWorkout.set(s.workoutId, [...(porWorkout.get(s.workoutId) ?? []), s])
  return [...porWorkout.entries()]
    .map(([workoutId, propios]) => ({
      workoutId,
      fecha: terminados.get(workoutId)!.fechaInicio,
      pesoMaximo: pesoMaximo(propios),
      volumen: volumen(propios),
      mejor1RM: Math.max(...propios.map((s) => epley(s.peso, s.reps))),
    }))
    .sort((a, b) => a.fecha - b.fecha)
}

/** Fechas de inicio de los entrenos terminados (para el calendario y la racha). */
export async function fechasEntrenadas(): Promise<number[]> {
  return (await db.workouts.toArray()).filter((w) => w.fechaFin !== undefined).map((w) => w.fechaInicio)
}
