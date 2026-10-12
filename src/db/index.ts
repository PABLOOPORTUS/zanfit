import Dexie, { type EntityTable, type Transaction } from 'dexie'
import type { Ajustes, Exercise, MedioPropio, Perfil, Plan, Routine, Workout, WorkoutSet } from '../types'
import { EJERCICIOS_BASE } from './ejerciciosBase'
import { RUTINAS_BASE } from './rutinasBase'
import { normalizar } from '../lib/texto'

export const db = new Dexie('zanfit') as Dexie & {
  exercises: EntityTable<Exercise, 'id'>
  routines: EntityTable<Routine, 'id'>
  workouts: EntityTable<Workout, 'id'>
  sets: EntityTable<WorkoutSet, 'id'>
  ajustes: EntityTable<Ajustes, 'id'>
  perfil: EntityTable<Perfil, 'id'>
  plan: EntityTable<Plan, 'id'>
  medios: EntityTable<MedioPropio, 'id'>
}

// Solo se indexan los campos por los que se consulta. Nunca modificar una versión existente:
// para cambiar el esquema, agregar db.version(n + 1).
db.version(1).stores({
  ejercicios: '++id, nombre, grupoMuscular',
  rutinas: '++id, nombre, creadaEn',
  sesiones: '++id, rutinaId, inicio',
})

// v2: modelo definitivo con nombres de tabla en inglés. Las tablas de la v1 solo tenían datos de prueba
// (la app no se había publicado), así que se eliminan sin migrar.
db.version(2)
  .stores({
    ejercicios: null,
    rutinas: null,
    sesiones: null,
    exercises: '++id, nombre, grupoMuscular, equipo',
    routines: '++id, nombre',
    workouts: '++id, routineId, fechaInicio',
    sets: '++id, workoutId, exerciseId, [workoutId+exerciseId]',
  })
  .upgrade(cargarCatalogo)

// v3: sin cambios de tablas. Agrega las rutinas de ejemplo a las bases que ya estaban en v2.
db.version(3).stores({}).upgrade(cargarRutinasEjemplo)

// v4: tabla de ajustes (unidad y descanso por defecto). Si no hay fila, se usan AJUSTES_POR_DEFECTO.
db.version(4).stores({ ajustes: 'id' })

// v5: sin cambios de tablas. Agrega a las bases existentes los ejercicios nuevos del catálogo (máquinas, poleas y Smith).
// Si el usuario ya tenía un ejercicio propio con el mismo nombre, no se duplica.
db.version(5).stores({}).upgrade(async (tx) => {
  const ejercicios = tx.table<Exercise, number>('exercises')
  const existentes = new Set((await ejercicios.toArray()).map((e) => normalizar(e.nombre)))
  await ejercicios.bulkAdd(EJERCICIOS_BASE.filter((e) => !existentes.has(normalizar(e.nombre))).map((e) => ({ ...e, propio: false })))
})

// v6: evaluación inicial (perfil) y plan de entrenamiento generado.
db.version(6).stores({ perfil: 'id', plan: 'id' })

// v7: fotos y videos propios de cada ejercicio (Blobs; no entran en el respaldo JSON general).
db.version(7).stores({ medios: '++id, exerciseId' })

export const AJUSTES_POR_DEFECTO: Ajustes = { id: 'general', unidad: 'kg', descansoPorDefectoSeg: 90 }

export async function obtenerAjustes(): Promise<Ajustes> {
  return { ...AJUSTES_POR_DEFECTO, ...(await db.ajustes.get('general')) }
}

export async function guardarAjustes(cambios: Partial<Omit<Ajustes, 'id'>>): Promise<void> {
  await db.ajustes.put({ ...(await obtenerAjustes()), ...cambios })
}

// `populate` corre cuando la base se crea desde cero; los `upgrade` cuando viene de una versión anterior.
db.on('populate', async (tx) => {
  await cargarCatalogo(tx)
  await cargarRutinasEjemplo(tx)
})

function cargarCatalogo(tx: Transaction) {
  return tx.table('exercises').bulkAdd(EJERCICIOS_BASE.map((e) => ({ ...e, propio: false })))
}

/** Agrega Push, Pull y Legs solo si todavía no hay rutinas. Omite ejercicios del catálogo que no existan. */
async function cargarRutinasEjemplo(tx: Transaction) {
  const rutinas = tx.table<Routine, number>('routines')
  if ((await rutinas.count()) > 0) return
  const ejercicios = await tx.table<Exercise, number>('exercises').toArray()
  const idPorNombre = new Map(ejercicios.map((e) => [e.nombre, e.id!]))
  await rutinas.bulkAdd(
    RUTINAS_BASE.map((r) => ({
      nombre: r.nombre,
      ejercicios: r.ejercicios.flatMap(({ nombre, ...objetivo }) => {
        const exerciseId = idPorNombre.get(nombre)
        return exerciseId === undefined ? [] : [{ exerciseId, ...objetivo }]
      }),
    })),
  )
}
