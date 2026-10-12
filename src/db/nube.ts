import { BASE_INVITADO, crearBase, db, limpiarCambio, nombreBase, sinAnotarCambios, ultimoCambio, usarBase } from '.'
import { cliente } from '../lib/clienteNube'
import { crearRespaldo, leerRespaldo, restaurarRespaldo } from './respaldo'

/**
 * Sincronización con Supabase: cada usuario tiene UNA fila con la copia completa de sus datos (como el respaldo JSON).
 * Gana lo más reciente: si otro teléfono subió algo nuevo y aquí no hay cambios, se baja; si aquí hay cambios, se suben.
 * Si cambió en los dos lados (sin conexión en ambos), se queda lo último que se modificó.
 */

const TABLA = 'datos_usuario'
const claveRemoto = (uid: string) => `zanfit:remoto:${uid}`

export type ResultadoSync = 'subido' | 'bajado' | 'al-dia'

function remotoConocido(uid: string): number {
  try {
    return Number(localStorage.getItem(claveRemoto(uid))) || 0
  } catch {
    return 0
  }
}

function recordarRemoto(uid: string, momento: number) {
  try {
    localStorage.setItem(claveRemoto(uid), String(momento))
  } catch {
    // Sin localStorage se vuelve a comparar todo la próxima vez; no se pierde nada.
  }
}

function dispositivo(): string {
  try {
    let id = localStorage.getItem('zanfit:dispositivo')
    if (!id) localStorage.setItem('zanfit:dispositivo', (id = crypto.randomUUID()))
    return id
  } catch {
    return 'desconocido'
  }
}

/** Errores de la tabla (por ejemplo, si todavía no se corrió supabase/esquema.sql). */
export class ErrorNube extends Error {}

function revisar(error: { message: string; code?: string } | null) {
  if (!error) return
  if (error.code === '42P01' || error.code === 'PGRST205' || /does not exist|schema cache/i.test(error.message))
    throw new ErrorNube('Falta crear la tabla en Supabase (supabase/esquema.sql).')
  throw new ErrorNube(error.message)
}

async function momentoRemoto(uid: string): Promise<number | null> {
  const { data, error } = await (await cliente()).from(TABLA).select('actualizado_en').eq('user_id', uid).maybeSingle()
  revisar(error)
  return data ? new Date(data.actualizado_en).getTime() : null
}

export async function hayDatosEnLaNube(uid: string): Promise<boolean> {
  return (await momentoRemoto(uid)) !== null
}

export async function subir(uid: string): Promise<void> {
  const inicio = Date.now()
  const datos = await crearRespaldo()
  const momento = new Date()
  const { error } = await (await cliente()).from(TABLA).upsert({ user_id: uid, datos, actualizado_en: momento.toISOString(), dispositivo: dispositivo() })
  revisar(error)
  recordarRemoto(uid, momento.getTime())
  limpiarCambio(db.name, inicio)
}

async function bajar(uid: string): Promise<void> {
  const { data, error } = await (await cliente()).from(TABLA).select('datos, actualizado_en').eq('user_id', uid).single()
  revisar(error)
  if (!data) throw new ErrorNube('No se encontraron datos en la nube.')
  await sinAnotarCambios(() => restaurarRespaldo(leerRespaldo(JSON.stringify(data.datos))))
  recordarRemoto(uid, new Date(data.actualizado_en).getTime())
  limpiarCambio(db.name, Date.now())
}

export async function sincronizar(uid: string): Promise<ResultadoSync> {
  const remoto = await momentoRemoto(uid)
  const local = ultimoCambio(db.name)
  if (remoto !== null && remoto > remotoConocido(uid) && (local === null || remoto >= local)) {
    await bajar(uid)
    return 'bajado'
  }
  if (local !== null || remoto === null) {
    await subir(uid)
    return 'subido'
  }
  return 'al-dia'
}

/** ¿Hay entrenos o una evaluación guardados sin cuenta en este teléfono? (para ofrecer subirlos al crear la cuenta) */
export async function hayDatosDeInvitado(): Promise<boolean> {
  const invitado = crearBase(BASE_INVITADO)
  try {
    return (await invitado.workouts.count()) > 0 || (await invitado.perfil.count()) > 0
  } finally {
    invitado.close()
  }
}

/** Copia los datos sin cuenta (incluidas las fotos y videos propios) a la base del usuario y los deja listos para subir. */
export async function copiarInvitadoAUsuario(uid: string): Promise<void> {
  const invitado = crearBase(BASE_INVITADO)
  try {
    const respaldo = await crearRespaldo(invitado)
    const medios = await invitado.medios.toArray()
    const base = usarBase(nombreBase(uid))
    await restaurarRespaldo(respaldo, base)
    // Los ids de los ejercicios se conservan al restaurar, así que las fotos y videos siguen apuntando al ejercicio correcto.
    await base.medios.bulkAdd(medios.map(({ id: _id, ...m }) => m))
  } finally {
    invitado.close()
  }
}
