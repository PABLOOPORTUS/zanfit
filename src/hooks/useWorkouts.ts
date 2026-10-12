import { useLiveQuery } from 'dexie-react-hooks'
import { db, obtenerAjustes } from '../db'
import { agruparPorEjercicio, fechasEntrenadas, historial, progresoEjercicio, recordsPorEjercicio, resumenEntreno } from '../db/progreso'
import { completoTodo, debeSubir, obtenerEntrenoActivo, sesionesAnteriores } from '../db/workouts'

/** Entreno en curso: `undefined` mientras carga, `null` si no hay. */
export function useEntrenoActivo() {
  return useLiveQuery(async () => (await obtenerEntrenoActivo()) ?? null)
}

/** Ejercicios del entreno con sus series y el descanso que corresponde a cada uno (de la rutina o por defecto). */
export function useBloquesEntreno(workoutId: number) {
  return useLiveQuery(async () => {
    const workout = await db.workouts.get(workoutId)
    const rutina = workout?.routineId !== undefined ? await db.routines.get(workout.routineId) : undefined
    const bloques = await agruparPorEjercicio(await db.sets.where('workoutId').equals(workoutId).toArray())
    const { descansoPorDefectoSeg } = await obtenerAjustes()
    return Promise.all(
      bloques.map(async (b) => {
        const objetivo = rutina?.ejercicios.find((e) => e.exerciseId === b.exercise.id)
        const sesiones = await sesionesAnteriores(b.exercise.id!, workoutId)
        const anteriores = sesiones[0] ?? []
        const subePeso = debeSubir(sesiones, objetivo)
        return {
          ...b,
          descansoSeg: objetivo?.descansoSeg ?? descansoPorDefectoSeg,
          /** Series de la última vez (para mostrar "Última vez: …"). */
          anteriores,
          /** Completaste todo en las dos últimas sesiones: hoy el peso viene subido. */
          subePeso,
          /** Completaste todo solo la última vez: si hoy también, la próxima sube. */
          casiSube: !subePeso && completoTodo(anteriores, objetivo),
        }
      }),
    )
  }, [workoutId])
}

/** Último entreno terminado: `undefined` mientras carga, `null` si no hay. */
export function useUltimoEntreno() {
  return useLiveQuery(async () => {
    const recientes = await db.workouts.orderBy('fechaInicio').reverse().toArray()
    return recientes.find((w) => w.fechaFin !== undefined) ?? null
  })
}

/** `undefined` mientras carga, `null` si no existe. */
export function useResumenEntreno(id: number) {
  return useLiveQuery(() => resumenEntreno(id), [id])
}

export function useHistorial() {
  return useLiveQuery(historial)
}

export function useRecordsPorEjercicio() {
  return useLiveQuery(recordsPorEjercicio)
}

export function useProgresoEjercicio(id: number) {
  return useLiveQuery(() => progresoEjercicio(id), [id])
}

export function useFechasEntrenadas() {
  return useLiveQuery(fechasEntrenadas)
}
