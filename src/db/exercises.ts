import { db } from '.'
import { normalizar } from '../lib/texto'
import type { Exercise } from '../types'

export type DatosEjercicio = Pick<Exercise, 'nombre' | 'grupoMuscular' | 'equipo' | 'instrucciones'>

export async function existeNombre(nombre: string, excluirId?: number): Promise<boolean> {
  const buscado = normalizar(nombre)
  const repetido = await db.exercises
    .filter((e) => e.id !== excluirId && normalizar(e.nombre) === buscado)
    .first()
  return repetido !== undefined
}

function limpiar(datos: DatosEjercicio): DatosEjercicio {
  return { ...datos, nombre: datos.nombre.trim(), instrucciones: datos.instrucciones?.trim() || undefined }
}

/** Crea un ejercicio propio y devuelve su id. */
export async function crearEjercicio(datos: DatosEjercicio): Promise<number> {
  return (await db.exercises.add({ ...limpiar(datos), propio: true })) as number
}

/** Solo los ejercicios propios se pueden editar. */
export async function actualizarEjercicio(id: number, datos: DatosEjercicio): Promise<void> {
  const actual = await db.exercises.get(id)
  if (!actual?.propio) throw new Error('Solo se pueden editar ejercicios propios')
  await db.exercises.update(id, limpiar(datos))
}

/** En cuántas rutinas y entrenamientos aparece el ejercicio; si aparece en alguno, no se puede eliminar. */
export async function contarUsos(id: number): Promise<{ rutinas: number; entrenamientos: number }> {
  const [rutinas, sets] = await Promise.all([
    db.routines.filter((r) => r.ejercicios.some((e) => e.exerciseId === id)).count(),
    db.sets.where('exerciseId').equals(id).toArray(),
  ])
  return { rutinas, entrenamientos: new Set(sets.map((s) => s.workoutId)).size }
}

export async function eliminarEjercicio(id: number): Promise<void> {
  const actual = await db.exercises.get(id)
  if (!actual?.propio) throw new Error('Solo se pueden eliminar ejercicios propios')
  const usos = await contarUsos(id)
  if (usos.rutinas + usos.entrenamientos > 0) throw new Error('El ejercicio está en uso')
  await db.exercises.delete(id)
}

export interface RegistroEjercicio {
  seriesCompletadas: number
  mejorPeso: number | null
  /** Fecha de inicio del último entrenamiento con una serie completada de este ejercicio. */
  ultimaVez: number | null
}

export async function obtenerRegistro(id: number): Promise<RegistroEjercicio> {
  const sets = (await db.sets.where('exerciseId').equals(id).toArray()).filter((s) => s.completada)
  if (sets.length === 0) return { seriesCompletadas: 0, mejorPeso: null, ultimaVez: null }
  const workouts = await db.workouts.bulkGet([...new Set(sets.map((s) => s.workoutId))])
  const fechas = workouts.flatMap((w) => (w ? [w.fechaInicio] : []))
  return {
    seriesCompletadas: sets.length,
    mejorPeso: Math.max(...sets.map((s) => s.peso)),
    ultimaVez: fechas.length ? Math.max(...fechas) : null,
  }
}
