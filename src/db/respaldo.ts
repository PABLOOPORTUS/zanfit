import { db } from '.'
import type { Ajustes, Exercise, Perfil, Plan, Routine, Workout, WorkoutSet } from '../types'

/** Sube este número si cambia la forma del respaldo (y agrega la conversión en `leerRespaldo`). */
const FORMATO = 1

export interface Respaldo {
  app: 'zanfit'
  formato: number
  exportadoEn: number
  datos: {
    exercises: Exercise[]
    routines: Routine[]
    workouts: Workout[]
    sets: WorkoutSet[]
    ajustes: Ajustes[]
    /** Desde la v6. Los respaldos anteriores no los traen. */
    perfil: Perfil[]
    plan: Plan[]
  }
}

export async function crearRespaldo(): Promise<Respaldo> {
  return db.transaction('r', [db.exercises, db.routines, db.workouts, db.sets, db.ajustes, db.perfil, db.plan], async () => ({
    app: 'zanfit',
    formato: FORMATO,
    exportadoEn: Date.now(),
    datos: {
      exercises: await db.exercises.toArray(),
      routines: await db.routines.toArray(),
      workouts: await db.workouts.toArray(),
      sets: await db.sets.toArray(),
      ajustes: await db.ajustes.toArray(),
      perfil: await db.perfil.toArray(),
      plan: await db.plan.toArray(),
    },
  }))
}

export function nombreArchivoRespaldo(fecha = new Date()): string {
  const dos = (n: number) => String(n).padStart(2, '0')
  return `zanfit-respaldo-${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}.json`
}

const esNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const esTexto = (v: unknown): v is string => typeof v === 'string'
const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function validarLista<T>(lista: unknown, nombre: string, valido: (x: Record<string, unknown>) => boolean): T[] {
  if (!Array.isArray(lista)) throw new Error(`Falta la lista de ${nombre}.`)
  lista.forEach((x, i) => {
    if (!esObjeto(x) || !esNumero(x.id) || !valido(x)) throw new Error(`Hay un registro inválido en ${nombre} (posición ${i + 1}).`)
  })
  return lista as T[]
}

/** Valida el contenido completo antes de tocar la base. Lanza un Error con un mensaje para el usuario. */
export function leerRespaldo(texto: string): Respaldo {
  let json: unknown
  try {
    json = JSON.parse(texto)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  if (!esObjeto(json) || json.app !== 'zanfit' || !esObjeto(json.datos)) throw new Error('Este archivo no es un respaldo de ZANFIT.')
  if (!esNumero(json.formato) || json.formato > FORMATO) throw new Error('El respaldo es de una versión más nueva de ZANFIT. Actualiza la app e inténtalo de nuevo.')
  const d = json.datos
  const datos: Respaldo['datos'] = {
    exercises: validarLista(d.exercises, 'ejercicios', (x) => esTexto(x.nombre) && esTexto(x.grupoMuscular) && esTexto(x.equipo)),
    routines: validarLista(d.routines, 'rutinas', (x) => esTexto(x.nombre) && Array.isArray(x.ejercicios)),
    workouts: validarLista(d.workouts, 'entrenos', (x) => esTexto(x.nombre) && esNumero(x.fechaInicio)),
    sets: validarLista(d.sets, 'series', (x) => esNumero(x.workoutId) && esNumero(x.exerciseId) && esNumero(x.peso) && esNumero(x.reps)),
    ajustes: Array.isArray(d.ajustes) ? (d.ajustes as Ajustes[]).filter((a) => esObjeto(a) && a.id === 'general') : [],
    perfil: Array.isArray(d.perfil) ? (d.perfil as Perfil[]).filter((x) => esObjeto(x) && x.id === 'general' && esTexto(x.sexo) && esNumero(x.pesoKg)) : [],
    plan: Array.isArray(d.plan) ? (d.plan as Plan[]).filter((x) => esObjeto(x) && x.id === 'actual' && Array.isArray(x.rutinaIds)) : [],
  }
  return { app: 'zanfit', formato: json.formato, exportadoEn: esNumero(json.exportadoEn) ? json.exportadoEn : 0, datos }
}

/** Reemplaza TODOS los datos por los del respaldo, en una sola transacción (si algo falla, no cambia nada). */
export async function restaurarRespaldo(respaldo: Respaldo): Promise<void> {
  const { datos } = respaldo
  const tablas = [db.exercises, db.routines, db.workouts, db.sets, db.ajustes, db.perfil, db.plan]
  await db.transaction('rw', tablas, async () => {
    await Promise.all(tablas.map((t) => t.clear()))
    await db.exercises.bulkAdd(datos.exercises)
    await db.routines.bulkAdd(datos.routines)
    await db.workouts.bulkAdd(datos.workouts)
    await db.sets.bulkAdd(datos.sets)
    await db.ajustes.bulkAdd(datos.ajustes)
    await db.perfil.bulkAdd(datos.perfil)
    await db.plan.bulkAdd(datos.plan)
  })
}
