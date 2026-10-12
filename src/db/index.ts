import Dexie, { type EntityTable, type Transaction } from 'dexie'
import type { Ajustes, Exercise, MedioPropio, Perfil, Plan, Routine, Workout, WorkoutSet } from '../types'
import { EJERCICIOS_BASE } from './ejerciciosBase'
import { RUTINAS_BASE } from './rutinasBase'
import { normalizar } from '../lib/texto'

export type BaseZanfit = Dexie & {
  exercises: EntityTable<Exercise, 'id'>
  routines: EntityTable<Routine, 'id'>
  workouts: EntityTable<Workout, 'id'>
  sets: EntityTable<WorkoutSet, 'id'>
  ajustes: EntityTable<Ajustes, 'id'>
  perfil: EntityTable<Perfil, 'id'>
  plan: EntityTable<Plan, 'id'>
  medios: EntityTable<MedioPropio, 'id'>
}

/** Base sin cuenta (la de siempre). Cada usuario con cuenta tiene la suya: `zanfit-u-<id de Supabase>`. */
/** Ejercicios que ya no están en el catálogo (ver la v8). */
const RETIRADOS_DEL_CATALOGO = ['Pallof press']

export const BASE_INVITADO = 'zanfit'
export const nombreBase = (userId?: string | null) => (userId ? `zanfit-u-${userId}` : BASE_INVITADO)

/** Tablas que entran en la sincronización (las fotos y videos propios, no: son pesados y viven solo en el teléfono). */
const TABLAS_SINCRONIZADAS = ['exercises', 'routines', 'workouts', 'sets', 'ajustes', 'perfil', 'plan']

export function crearBase(nombre: string): BaseZanfit {
  const base = new Dexie(nombre) as BaseZanfit

  // Solo se indexan los campos por los que se consulta. Nunca modificar una versión existente:
  // para cambiar el esquema, agregar base.version(n + 1).
  base.version(1).stores({
    ejercicios: '++id, nombre, grupoMuscular',
    rutinas: '++id, nombre, creadaEn',
    sesiones: '++id, rutinaId, inicio',
  })

  // v2: modelo definitivo con nombres de tabla en inglés. Las tablas de la v1 solo tenían datos de prueba
  // (la app no se había publicado), así que se eliminan sin migrar.
  base
    .version(2)
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
  base.version(3).stores({}).upgrade(cargarRutinasEjemplo)

  // v4: tabla de ajustes (unidad y descanso por defecto). Si no hay fila, se usan AJUSTES_POR_DEFECTO.
  base.version(4).stores({ ajustes: 'id' })

  // v5: sin cambios de tablas. Agrega a las bases existentes los ejercicios nuevos del catálogo (máquinas, poleas y Smith).
  // Si el usuario ya tenía un ejercicio propio con el mismo nombre, no se duplica.
  base
    .version(5)
    .stores({})
    .upgrade(async (tx) => {
      const ejercicios = tx.table<Exercise, number>('exercises')
      const existentes = new Set((await ejercicios.toArray()).map((e) => normalizar(e.nombre)))
      await ejercicios.bulkAdd(EJERCICIOS_BASE.filter((e) => !existentes.has(normalizar(e.nombre))).map((e) => ({ ...e, propio: false })))
    })

  // v6: evaluación inicial (perfil) y plan de entrenamiento generado.
  base.version(6).stores({ perfil: 'id', plan: 'id' })

  // v7: fotos y videos propios de cada ejercicio (Blobs; no entran en el respaldo JSON general).
  base.version(7).stores({ medios: '++id, exerciseId' })

  // v8: sin cambios de tablas. Se quitan del catálogo los ejercicios sin ninguna imagen libre (Pallof press), salvo que
  // el usuario ya los use en una rutina o en su historial (así no se pierden datos).
  base
    .version(8)
    .stores({})
    .upgrade(async (tx) => {
      const ejercicios = tx.table<Exercise, number>('exercises')
      const rutinas = await tx.table<Routine, number>('routines').toArray()
      for (const nombre of RETIRADOS_DEL_CATALOGO) {
        const ejercicio = await ejercicios.where('nombre').equals(nombre).first()
        if (!ejercicio || ejercicio.propio) continue
        const enRutina = rutinas.some((r) => r.ejercicios.some((e) => e.exerciseId === ejercicio.id))
        const enHistorial = (await tx.table('sets').where('exerciseId').equals(ejercicio.id!).count()) > 0
        if (!enRutina && !enHistorial) await ejercicios.delete(ejercicio.id!)
      }
    })

  // `populate` corre cuando la base se crea desde cero; los `upgrade` cuando viene de una versión anterior.
  // El catálogo inicial no cuenta como cambio local (si no, una base recién creada pisaría los datos de la nube).
  base.on('populate', async (tx) => {
    silenciar++
    try {
      await cargarCatalogo(tx)
      await cargarRutinasEjemplo(tx)
    } finally {
      silenciar--
    }
  })

  // Cualquier cambio en una tabla sincronizada queda anotado para subirlo a la nube (ver db/nube.ts).
  for (const tabla of TABLAS_SINCRONIZADAS) {
    const t = base.table(tabla)
    t.hook('creating', () => anotarCambio(nombre))
    t.hook('updating', () => anotarCambio(nombre))
    t.hook('deleting', () => anotarCambio(nombre))
  }

  return base
}

/**
 * Base activa. Es un `let` exportado: los módulos que hacen `import { db }` ven siempre la base actual (los imports de
 * ES modules son enlaces vivos). Al cambiar de usuario, la app se vuelve a montar entera (ver ProveedorCuenta).
 */
export let db: BaseZanfit = crearBase(BASE_INVITADO)

export function usarBase(nombre: string): BaseZanfit {
  if (db.name !== nombre) {
    db.close()
    db = crearBase(nombre)
  }
  return db
}

// --- Cambios pendientes de sincronizar ---------------------------------------------------------------------------

let silenciar = 0
const claveCambio = (base: string) => `zanfit:cambio:${base}`

function anotarCambio(base: string) {
  if (silenciar > 0) return
  try {
    localStorage.setItem(claveCambio(base), String(Date.now()))
  } catch {
    // Sin localStorage no hay sincronización automática, pero la app funciona igual.
  }
  window.dispatchEvent(new CustomEvent('zanfit:cambio', { detail: base }))
}

/** Momento del último cambio local que todavía no se sube (`null` si está todo subido). */
export function ultimoCambio(base: string): number | null {
  try {
    return Number(localStorage.getItem(claveCambio(base))) || null
  } catch {
    return null
  }
}

export function limpiarCambio(base: string, hasta: number) {
  try {
    if ((ultimoCambio(base) ?? 0) <= hasta) localStorage.removeItem(claveCambio(base))
  } catch {
    // Ver anotarCambio.
  }
}

/** Ejecuta algo sin anotarlo como cambio local (por ejemplo, al restaurar los datos que vienen de la nube). */
export async function sinAnotarCambios<T>(fn: () => Promise<T>): Promise<T> {
  silenciar++
  try {
    return await fn()
  } finally {
    silenciar--
  }
}

// --- Ajustes ------------------------------------------------------------------------------------------------------

export const AJUSTES_POR_DEFECTO: Ajustes = { id: 'general', unidad: 'kg', descansoPorDefectoSeg: 90 }

export async function obtenerAjustes(): Promise<Ajustes> {
  return { ...AJUSTES_POR_DEFECTO, ...(await db.ajustes.get('general')) }
}

export async function guardarAjustes(cambios: Partial<Omit<Ajustes, 'id'>>): Promise<void> {
  await db.ajustes.put({ ...(await obtenerAjustes()), ...cambios })
}

// --- Datos iniciales -----------------------------------------------------------------------------------------------

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
