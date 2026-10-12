import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { compararNombres } from '../lib/texto'

/** Rutinas ordenadas por nombre. `undefined` mientras carga. */
export function useRoutines() {
  return useLiveQuery(async () => (await db.routines.toArray()).sort((a, b) => compararNombres(a.nombre, b.nombre)))
}

/** `undefined` mientras carga, `null` si no existe. */
export function useRoutine(id: number) {
  return useLiveQuery(async () => (await db.routines.get(id)) ?? null, [id])
}
