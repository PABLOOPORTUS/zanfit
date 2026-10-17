import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { inicioSemana, rachaSemanal } from '../lib/calculos'
import { caloriasEntreno, PESO_POR_DEFECTO } from '../lib/calorias'
import { calcularJuego } from '../lib/juego'
import { calcularLogros } from '../lib/logros'
import type { WorkoutSet } from '../types'

/** Logros calculados desde el historial. `undefined` mientras carga. */
export function useLogros() {
  return useLiveQuery(async () => {
    const [workouts, sets, plan, rutinas] = await Promise.all([
      db.workouts.toArray(),
      db.sets.toArray(),
      db.plan.get('actual'),
      db.routines.toArray(),
    ])
    return calcularLogros(workouts, sets, plan?.rutinaIds.length ?? 0, plan?.rutinaIds ?? [], rutinas)
  })
}

/** Entrenos de esta semana (lunes a domingo), la meta y la racha. `undefined` mientras carga. */
export function useMetaSemanal() {
  return useLiveQuery(async () => {
    const [workouts, perfil, plan] = await Promise.all([db.workouts.toArray(), db.perfil.get('general'), db.plan.get('actual')])
    const terminados = workouts.filter((w) => w.fechaFin !== undefined).map((w) => w.fechaInicio)
    const lunes = inicioSemana(Date.now()).getTime()
    // Calorías estimadas de los entrenos de esta semana.
    const deLaSemana = workouts.filter((w) => w.fechaFin !== undefined && w.fechaInicio >= lunes)
    const sets = (
      await db.sets
        .where('workoutId')
        .anyOf(deLaSemana.map((w) => w.id!))
        .toArray()
    ).filter((s) => s.completada)
    const ejercicios = new Map(
      (await db.exercises.bulkGet([...new Set(sets.map((s) => s.exerciseId))])).flatMap((e) => (e ? [[e.id!, e] as const] : [])),
    )
    const kcal = deLaSemana.reduce((total, w) => {
      const porEjercicio = new Map<number, WorkoutSet[]>()
      for (const s of sets) if (s.workoutId === w.id) porEjercicio.set(s.exerciseId, [...(porEjercicio.get(s.exerciseId) ?? []), s])
      const partes = [...porEjercicio].flatMap(([id, propias]) =>
        ejercicios.has(id) ? [{ ejercicio: ejercicios.get(id)!, series: propias.length, sets: propias }] : [],
      )
      return total + caloriasEntreno(w.fechaFin! - w.fechaInicio, partes, perfil?.pesoKg ?? PESO_POR_DEFECTO)
    }, 0)
    return {
      kcal,
      hechos: terminados.filter((f) => f >= lunes).length,
      // La meta sale de la evaluación; si no hay, del plan; si tampoco, 3 por semana.
      meta: perfil?.diasPorSemana ?? plan?.rutinaIds.length ?? 3,
      racha: rachaSemanal(terminados),
      diaSemana: (new Date().getDay() + 6) % 7,
    }
  })
}

/** Puntos, nivel (animal) y avance. `undefined` mientras carga. */
export function useJuego() {
  return useLiveQuery(async () => {
    const [workouts, sets, plan, rutinas] = await Promise.all([
      db.workouts.toArray(),
      db.sets.toArray(),
      db.plan.get('actual'),
      db.routines.toArray(),
    ])
    return calcularJuego(workouts, sets, plan?.rutinaIds ?? [], rutinas)
  })
}
