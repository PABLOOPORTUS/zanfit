import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { obtenerPlan, rutinasDelPlan, siguienteDiaDelPlan } from '../db/plan'

/** Perfil de la evaluación: `undefined` mientras carga, `null` si no hay. */
export function usePerfil() {
  return useLiveQuery(async () => (await db.perfil.get('general')) ?? null)
}

/** Plan con sus rutinas y el id de la rutina que toca hoy: `undefined` mientras carga, `null` si no hay plan. */
export function usePlan() {
  return useLiveQuery(async () => {
    const plan = await obtenerPlan()
    if (!plan) return null
    return { plan, rutinas: await rutinasDelPlan(plan), siguienteId: await siguienteDiaDelPlan(plan) }
  })
}
