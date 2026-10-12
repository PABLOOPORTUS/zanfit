import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { inicioSemana, rachaSemanal } from '../lib/calculos'
import { calcularLogros } from '../lib/logros'

/** Logros calculados desde el historial. `undefined` mientras carga. */
export function useLogros() {
  return useLiveQuery(async () => {
    const [workouts, sets, plan] = await Promise.all([db.workouts.toArray(), db.sets.toArray(), db.plan.get('actual')])
    return calcularLogros(workouts, sets, plan?.rutinaIds.length ?? 0, plan?.rutinaIds ?? [])
  })
}

/** Entrenos de esta semana (lunes a domingo), la meta y la racha. `undefined` mientras carga. */
export function useMetaSemanal() {
  return useLiveQuery(async () => {
    const [workouts, perfil, plan] = await Promise.all([db.workouts.toArray(), db.perfil.get('general'), db.plan.get('actual')])
    const terminados = workouts.filter((w) => w.fechaFin !== undefined).map((w) => w.fechaInicio)
    const lunes = inicioSemana(Date.now()).getTime()
    return {
      hechos: terminados.filter((f) => f >= lunes).length,
      // La meta sale de la evaluación; si no hay, del plan; si tampoco, 3 por semana.
      meta: perfil?.diasPorSemana ?? plan?.rutinaIds.length ?? 3,
      racha: rachaSemanal(terminados),
      diaSemana: (new Date().getDay() + 6) % 7,
    }
  })
}
