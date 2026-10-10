import Dexie, { type EntityTable } from 'dexie'
import type { Ejercicio, Rutina, Sesion } from '../types'

export const db = new Dexie('zanfit') as Dexie & {
  ejercicios: EntityTable<Ejercicio, 'id'>
  rutinas: EntityTable<Rutina, 'id'>
  sesiones: EntityTable<Sesion, 'id'>
}

// Solo se indexan los campos por los que se consulta. Al cambiar el esquema, agregar db.version(n+1).
db.version(1).stores({
  ejercicios: '++id, nombre, grupoMuscular',
  rutinas: '++id, nombre, creadaEn',
  sesiones: '++id, rutinaId, inicio',
})
