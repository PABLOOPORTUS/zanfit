import { db } from '.'
import { generarPlan, type PlanGenerado } from '../lib/plan'
import type { Perfil, Plan } from '../types'

const LETRAS = 'ABCDEF'

export function nombreDiaPlan(indice: number, nombre: string): string {
  return `Plan · Día ${LETRAS[indice]} — ${nombre}`
}

/**
 * Guarda la evaluación y genera el plan: cada día queda como una rutina normal ("Plan · Día A — Torso").
 * Si ya había un plan, sus rutinas se reemplazan (los entrenos hechos con ellas se mantienen en el historial).
 */
export async function guardarEvaluacion(perfil: Omit<Perfil, 'id' | 'actualizadoEn'>): Promise<PlanGenerado> {
  return db.transaction('rw', [db.perfil, db.plan, db.routines, db.exercises], async () => {
    const completo: Perfil = { ...perfil, id: 'general', actualizadoEn: Date.now() }
    await db.perfil.put(completo)
    const generado = generarPlan(completo, await db.exercises.toArray())
    const anterior = await db.plan.get('actual')
    if (anterior) await db.routines.bulkDelete(anterior.rutinaIds)
    const rutinaIds = (await db.routines.bulkAdd(
      generado.dias.map((d, i) => ({ nombre: nombreDiaPlan(i, d.nombre), ejercicios: d.ejercicios })),
      { allKeys: true },
    )) as number[]
    await db.plan.put({ id: 'actual', division: generado.division, rutinaIds, creadoEn: Date.now() })
    return generado
  })
}

export async function obtenerPlan(): Promise<Plan | undefined> {
  return db.plan.get('actual')
}

/** Rutinas del plan que todavía existen (el usuario puede haber borrado alguna), en orden. */
export async function rutinasDelPlan(plan: Plan) {
  return (await db.routines.bulkGet(plan.rutinaIds)).flatMap((r) => (r ? [r] : []))
}

/** El día que toca: el siguiente al último entreno terminado con una rutina del plan (o el primero). */
export async function siguienteDiaDelPlan(plan: Plan): Promise<number | undefined> {
  const rutinas = await rutinasDelPlan(plan)
  if (rutinas.length === 0) return undefined
  const ids = rutinas.map((r) => r.id!)
  const recientes = await db.workouts.orderBy('fechaInicio').reverse().toArray()
  const ultimo = recientes.find((w) => w.fechaFin !== undefined && w.routineId !== undefined && ids.includes(w.routineId))
  if (!ultimo) return ids[0]
  return ids[(ids.indexOf(ultimo.routineId!) + 1) % ids.length]
}

export async function eliminarPlan(): Promise<void> {
  await db.transaction('rw', db.plan, db.routines, async () => {
    const plan = await db.plan.get('actual')
    if (plan) await db.routines.bulkDelete(plan.rutinaIds)
    await db.plan.delete('actual')
  })
}
