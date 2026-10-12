import { db } from '.'
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
