import { db } from '.'
import { reemplazoEnRutina } from '../lib/plan'
import { normalizar } from '../lib/texto'
import type { Routine } from '../types'

export type DatosRutina = Omit<Routine, 'id'>

function limpiar(datos: DatosRutina): DatosRutina {
  return { nombre: datos.nombre.trim(), ejercicios: datos.ejercicios.map((e) => ({ ...e })) }
}

export async function crearRutina(datos: DatosRutina): Promise<number> {
  return (await db.routines.add(limpiar(datos))) as number
}

export async function actualizarRutina(id: number, datos: DatosRutina): Promise<void> {
  await db.routines.update(id, limpiar(datos))
}

/** Cambia un ejercicio de la rutina por otro en la misma posición (ver `reemplazoEnRutina`). */
export async function reemplazarEnRutina(id: number, anterior: number, nuevo: number): Promise<void> {
  await db.transaction('rw', db.routines, db.exercises, db.perfil, async () => {
    const [rutina, ejercicio, perfil] = await Promise.all([db.routines.get(id), db.exercises.get(nuevo), db.perfil.get('general')])
    if (!rutina || !ejercicio) return
    await db.routines.update(id, {
      ejercicios: rutina.ejercicios.map((e) => (e.exerciseId === anterior ? reemplazoEnRutina(e, ejercicio, perfil) : e)),
    })
  })
}

/** Crea "Push (copia)", "Push (copia 2)"… y devuelve el id de la copia. */
export async function duplicarRutina(id: number): Promise<number> {
  const original = await db.routines.get(id)
  if (!original) throw new Error('La rutina no existe')
  const nombres = new Set((await db.routines.toArray()).map((r) => normalizar(r.nombre)))
  let nombre = `${original.nombre} (copia)`
  for (let n = 2; nombres.has(normalizar(nombre)); n++) nombre = `${original.nombre} (copia ${n})`
  return crearRutina({ nombre, ejercicios: original.ejercicios })
}

/** Los entrenos hechos con la rutina se conservan (guardan su propio nombre). */
export async function eliminarRutina(id: number): Promise<void> {
  await db.routines.delete(id)
}
