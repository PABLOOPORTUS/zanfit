import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { contarUsos, obtenerRegistro } from '../db/exercises'
import { compararNombres } from '../lib/texto'

/** Todos los ejercicios ordenados por nombre. `undefined` mientras carga. */
export function useExercises() {
  return useLiveQuery(async () => {
    const ejercicios = await db.exercises.toArray()
    return ejercicios.sort((a, b) => compararNombres(a.nombre, b.nombre))
  })
}

/** `undefined` mientras carga, `null` si no existe. */
export function useExercise(id: number) {
  return useLiveQuery(async () => (await db.exercises.get(id)) ?? null, [id])
}

export function useUsosEjercicio(id: number) {
  return useLiveQuery(() => contarUsos(id), [id])
}

export function useRegistroEjercicio(id: number) {
  return useLiveQuery(() => obtenerRegistro(id), [id])
}
