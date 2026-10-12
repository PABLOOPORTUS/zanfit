import { db } from '.'
import { mejor1RM, pesoMaximo } from '../lib/calculos'
import type { Workout, WorkoutSet } from '../types'

const SERIES_POR_DEFECTO = 3

/** El entreno sin `fechaFin`. Solo puede haber uno a la vez. */
export async function obtenerEntrenoActivo(): Promise<Workout | undefined> {
  return db.workouts.filter((w) => w.fechaFin === undefined).first()
}

/**
 * Series completadas del último entreno terminado que incluyó el ejercicio, ordenadas por número de serie.
 * Sirven para precargar peso y reps.
 */
export async function ultimasSeries(exerciseId: number, excluirWorkoutId?: number): Promise<WorkoutSet[]> {
  const sets = (await db.sets.where('exerciseId').equals(exerciseId).toArray()).filter(
    (s) => s.completada && s.workoutId !== excluirWorkoutId,
  )
  if (sets.length === 0) return []
  const workouts = (await db.workouts.bulkGet([...new Set(sets.map((s) => s.workoutId))])).filter(
    (w): w is Workout => w?.fechaFin !== undefined,
  )
  if (workouts.length === 0) return []
  const ultimo = workouts.reduce((a, b) => (b.fechaInicio > a.fechaInicio ? b : a))
  return sets.filter((s) => s.workoutId === ultimo.id).sort((a, b) => a.numeroSerie - b.numeroSerie)
}

/** Series nuevas (sin completar) con el peso y las reps de la última vez; si no hay historial, usa las reps objetivo. */
async function seriesPrecargadas(
  workoutId: number,
  exerciseId: number,
  objetivo?: { series: number; reps: number },
): Promise<WorkoutSet[]> {
  const anteriores = await ultimasSeries(exerciseId, workoutId)
  const cantidad = objetivo?.series ?? (anteriores.length || SERIES_POR_DEFECTO)
  return Array.from({ length: cantidad }, (_, i) => {
    // Si hoy haces más series que la última vez, se repite la última.
    const previa = anteriores[Math.min(i, anteriores.length - 1)]
    return {
      workoutId,
      exerciseId,
      numeroSerie: i + 1,
      peso: previa?.peso ?? 0,
      reps: previa?.reps ?? objetivo?.reps ?? 0,
      completada: false,
    }
  })
}

/** Inicia un entreno (con rutina o libre). Si ya hay uno en curso, devuelve ese. */
export async function iniciarEntreno(routineId?: number): Promise<number> {
  return db.transaction('rw', db.workouts, db.sets, db.routines, async () => {
    const activo = await obtenerEntrenoActivo()
    if (activo) return activo.id!
    const rutina = routineId !== undefined ? await db.routines.get(routineId) : undefined
    const workoutId = (await db.workouts.add({
      routineId: rutina?.id,
      nombre: rutina?.nombre ?? 'Entreno libre',
      fechaInicio: Date.now(),
    })) as number
    for (const e of rutina?.ejercicios ?? []) {
      await db.sets.bulkAdd(
        await seriesPrecargadas(workoutId, e.exerciseId, { series: e.seriesObjetivo, reps: e.repsObjetivo }),
      )
    }
    return workoutId
  })
}

export async function agregarEjercicios(workoutId: number, exerciseIds: number[]): Promise<void> {
  const workout = await db.workouts.get(workoutId)
  const rutina = workout?.routineId !== undefined ? await db.routines.get(workout.routineId) : undefined
  for (const exerciseId of exerciseIds) {
    const enRutina = rutina?.ejercicios.find((e) => e.exerciseId === exerciseId)
    await db.sets.bulkAdd(
      await seriesPrecargadas(
        workoutId,
        exerciseId,
        enRutina && { series: enRutina.seriesObjetivo, reps: enRutina.repsObjetivo },
      ),
    )
  }
}

async function seriesDe(workoutId: number, exerciseId: number): Promise<WorkoutSet[]> {
  const sets = await db.sets.where('[workoutId+exerciseId]').equals([workoutId, exerciseId]).toArray()
  return sets.sort((a, b) => a.numeroSerie - b.numeroSerie)
}

/** Agrega una serie copiando el peso y las reps de la última. */
export async function agregarSerie(workoutId: number, exerciseId: number): Promise<void> {
  const sets = await seriesDe(workoutId, exerciseId)
  const ultima = sets.at(-1)
  await db.sets.add({
    workoutId,
    exerciseId,
    numeroSerie: (ultima?.numeroSerie ?? 0) + 1,
    peso: ultima?.peso ?? 0,
    reps: ultima?.reps ?? 0,
    completada: false,
  })
}

/** Quita la última serie. Siempre queda al menos una (para quitar todo, usa `quitarEjercicio`). */
export async function quitarUltimaSerie(workoutId: number, exerciseId: number): Promise<void> {
  const sets = await seriesDe(workoutId, exerciseId)
  if (sets.length > 1) await db.sets.delete(sets.at(-1)!.id!)
}

export async function quitarEjercicio(workoutId: number, exerciseId: number): Promise<void> {
  await db.sets.where('[workoutId+exerciseId]').equals([workoutId, exerciseId]).delete()
}

export async function actualizarSerie(id: number, cambios: Partial<Pick<WorkoutSet, 'peso' | 'reps' | 'completada'>>) {
  await db.sets.update(id, cambios)
}

/** Cierra el entreno. Las series sin marcar se descartan. */
export async function finalizarEntreno(id: number): Promise<void> {
  await db.transaction('rw', db.workouts, db.sets, async () => {
    await db.sets.where('workoutId').equals(id).and((s) => !s.completada).delete()
    await db.workouts.update(id, { fechaFin: Date.now() })
  })
}

/** Borra el entreno y todas sus series (descartar uno en curso o eliminar uno del historial). */
export async function eliminarEntreno(id: number): Promise<void> {
  await db.transaction('rw', db.workouts, db.sets, async () => {
    await db.sets.where('workoutId').equals(id).delete()
    await db.workouts.delete(id)
  })
}

export async function guardarNotas(id: number, notas: string): Promise<void> {
  await db.workouts.update(id, { notas: notas.trim() || undefined })
}

export interface RecordPersonal {
  exerciseId: number
  tipo: 'peso' | '1rm'
  valor: number
  anterior: number
}

/**
 * Récords que se rompieron en este entreno: peso máximo y 1RM estimado por ejercicio,
 * comparados con los entrenos terminados que empezaron antes. La primera vez que haces un ejercicio no cuenta como récord.
 */
export async function recordsDelEntreno(workoutId: number): Promise<RecordPersonal[]> {
  const workout = await db.workouts.get(workoutId)
  if (!workout) return []
  const sets = (await db.sets.where('workoutId').equals(workoutId).toArray()).filter((s) => s.completada)
  const anterioresIds = new Set(
    (await db.workouts.where('fechaInicio').below(workout.fechaInicio).toArray())
      .filter((w) => w.fechaFin !== undefined)
      .map((w) => w.id),
  )
  const records: RecordPersonal[] = []
  for (const exerciseId of new Set(sets.map((s) => s.exerciseId))) {
    const hoy = sets.filter((s) => s.exerciseId === exerciseId)
    const antes = (await db.sets.where('exerciseId').equals(exerciseId).toArray()).filter(
      (s) => s.completada && anterioresIds.has(s.workoutId),
    )
    if (antes.length === 0) continue
    const [pesoHoy, pesoAntes] = [pesoMaximo(hoy), pesoMaximo(antes)]
    const [rmHoy, rmAntes] = [mejor1RM(hoy), mejor1RM(antes)]
    if (pesoHoy > pesoAntes) records.push({ exerciseId, tipo: 'peso', valor: pesoHoy, anterior: pesoAntes })
    if (rmHoy > rmAntes + 0.01) records.push({ exerciseId, tipo: '1rm', valor: rmHoy, anterior: rmAntes })
  }
  return records
}
