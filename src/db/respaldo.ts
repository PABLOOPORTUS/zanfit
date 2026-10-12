import { completarCatalogo, db, type BaseZanfit } from '.'
import { fechaArchivo } from '../lib/compartir'
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

export async function crearRespaldo(base: BaseZanfit = db): Promise<Respaldo> {
  return base.transaction('r', [base.exercises, base.routines, base.workouts, base.sets, base.ajustes, base.perfil, base.plan], async () => ({
    app: 'zanfit',
    formato: FORMATO,
    exportadoEn: Date.now(),
    datos: {
      exercises: await base.exercises.toArray(),
      routines: await base.routines.toArray(),
      workouts: await base.workouts.toArray(),
      sets: await base.sets.toArray(),
      ajustes: await base.ajustes.toArray(),
      perfil: await base.perfil.toArray(),
      plan: await base.plan.toArray(),
    },
  }))
}

export function nombreArchivoRespaldo(fecha = new Date()): string {
  return `zanfit-respaldo-${fechaArchivo(fecha)}.json`
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
export async function restaurarRespaldo(respaldo: Respaldo, base: BaseZanfit = db): Promise<void> {
  const { datos } = respaldo
  const tablas = [base.exercises, base.routines, base.workouts, base.sets, base.ajustes, base.perfil, base.plan]
  await base.transaction('rw', tablas, async () => {
    await Promise.all(tablas.map((t) => t.clear()))
    await base.exercises.bulkAdd(datos.exercises)
    await base.routines.bulkAdd(datos.routines)
    await base.workouts.bulkAdd(datos.workouts)
    await base.sets.bulkAdd(datos.sets)
    await base.ajustes.bulkAdd(datos.ajustes)
    await base.perfil.bulkAdd(datos.perfil)
    await base.plan.bulkAdd(datos.plan)
  })
  // Un respaldo (o la copia de la nube) de una versión anterior trae menos ejercicios en el catálogo: se completan.
  await completarCatalogo(base)
}
