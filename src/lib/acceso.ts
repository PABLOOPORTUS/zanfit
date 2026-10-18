import { cliente } from './clienteNube'
import { generarCodigo } from './codigos'
import { idDispositivo } from './dispositivo'

/**
 * Acceso pagado (ver supabase/acceso.sql y api/registro.ts). Cada cuenta está en prueba (hasta una fecha), activa
 * (pagó) o bloqueada. La app lo consulta al abrir y lo guarda en localStorage para funcionar sin internet; la nube
 * además rechaza guardar datos de cuentas sin acceso (RLS), así que saltarse la app no sirve de mucho.
 */

/** pendiente: reservado (cuentas que esperan activación sin prueba); hoy las cuentas nuevas parten en prueba. */
export type EstadoCuenta = 'pendiente' | 'prueba' | 'activa' | 'bloqueada' | 'sin-cuenta'

export interface Acceso {
  estado: EstadoCuenta
  /** Fin de la prueba (ms). */
  pruebaHasta: number | null
  /** Fin del período pagado (ms); `null` = sin vencimiento. */
  activaHasta?: number | null
  /** La cuenta se está usando en otro teléfono (una cuenta, un teléfono a la vez). */
  otroDispositivo?: boolean
  /** Modo aporte voluntario (`ajustes_venta.aporte_voluntario`): nadie se bloquea por la fecha, solo las pausadas. */
  voluntario?: boolean
  admin: boolean
  /** Cuándo se revisó con la nube (ms). */
  revisado: number
}

export interface DatosVenta {
  precio: string
  datos_transferencia: string
  contacto: string
  dias_prueba: number
  /** Si está activo, la app es gratis y el pago es un aporte voluntario (ver supabase/aporte-voluntario.sql). */
  aporte_voluntario?: boolean
}

export interface Cuenta {
  user_id: string
  nombre: string
  correo: string
  estado: 'pendiente' | 'prueba' | 'activa' | 'bloqueada'
  prueba_hasta: string | null
  activa_hasta: string | null
  dispositivo_id?: string | null
  dispositivo_desde?: string | null
  /** Cuántas veces la cuenta pasó de un teléfono a otro (muchas en poco tiempo = la están compartiendo). */
  cambios_dispositivo?: number
  codigo: string | null
  nota: string
  creada_en: string
  activada_en: string | null
}

export interface Codigo {
  codigo: string
  tipo: 'prueba' | 'compra'
  dias: number
  nota: string
  creado_en: string
  usado_por: string | null
  usado_en: string | null
}

const clave = (uid: string) => `zanfit:acceso:${uid}`

export function accesoGuardado(uid: string): Acceso | null {
  try {
    return JSON.parse(localStorage.getItem(clave(uid)) ?? 'null') as Acceso | null
  } catch {
    return null
  }
}

function guardar(uid: string, acceso: Acceso) {
  try {
    localStorage.setItem(clave(uid), JSON.stringify(acceso))
  } catch {
    // Sin localStorage se vuelve a consultar cada vez.
  }
}

/** ¿Puede usar la app? Cuenta activa (sin vencer) o prueba vigente; en modo aporte voluntario, cualquiera no pausada. */
export const puedeUsar = (a: Pick<Acceso, 'estado' | 'pruebaHasta' | 'activaHasta' | 'voluntario'>, ahora = Date.now()) =>
  (a.voluntario === true && a.estado !== 'bloqueada' && a.estado !== 'sin-cuenta') ||
  (a.estado === 'activa' && (a.activaHasta == null || a.activaHasta > ahora)) ||
  (a.estado === 'prueba' && (a.pruebaHasta ?? 0) > ahora)

export const diasRestantes = (pruebaHasta: number | null, ahora = Date.now()) => Math.max(0, Math.ceil(((pruebaHasta ?? 0) - ahora) / 86_400_000))

/** Las tablas todavía no existen en Supabase (antes de correr supabase/acceso.sql): no se bloquea a nadie. */
const sinTablas = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === '42P01' || error.code === 'PGRST205' || /does not exist|could not find the table/i.test(error.message ?? ''))

/**
 * Consulta el acceso en la nube y lo guarda. Sin conexión (o si falla) devuelve el último guardado; si nunca se
 * consultó, `null` (la app deja pasar y vuelve a intentar: no se bloquea a alguien por falta de señal).
 */
export async function revisarAcceso(uid: string): Promise<Acceso | null> {
  try {
    const sb = await cliente()
    const [cuenta, admin, venta] = await Promise.all([
      sb.from('cuentas').select('*').eq('user_id', uid).maybeSingle(),
      sb.from('admins').select('user_id').eq('user_id', uid).maybeSingle(),
      // `*` para no fallar si la columna aporte_voluntario todavía no existe.
      sb.from('ajustes_venta').select('*').eq('id', 1).maybeSingle(),
    ])
    if (sinTablas(cuenta.error)) {
      const acceso: Acceso = { estado: 'activa', pruebaHasta: null, admin: false, revisado: Date.now() }
      guardar(uid, acceso)
      return acceso
    }
    if (cuenta.error) return accesoGuardado(uid)
    const fila = cuenta.data as {
      estado: Acceso['estado']
      prueba_hasta: string | null
      activa_hasta?: string | null
      dispositivo_id?: string | null
    } | null
    // Cuentas sin teléfono asignado (de antes de esta regla): este teléfono pasa a ser el suyo, sin preguntar.
    if (fila && fila.dispositivo_id === null) await usarEsteDispositivo()
    const acceso: Acceso = {
      estado: fila?.estado ?? 'sin-cuenta',
      pruebaHasta: fila?.prueba_hasta ? new Date(fila.prueba_hasta).getTime() : null,
      activaHasta: fila?.activa_hasta ? new Date(fila.activa_hasta).getTime() : null,
      otroDispositivo: !!fila?.dispositivo_id && fila.dispositivo_id !== idDispositivo(),
      admin: !!admin.data,
      voluntario: !!(venta.data as DatosVenta | null)?.aporte_voluntario,
      revisado: Date.now(),
    }
    guardar(uid, acceso)
    return acceso
  } catch {
    return accesoGuardado(uid)
  }
}

/**
 * Deja este teléfono como el de la cuenta (al ingresar o al tocar "Usar aquí"): el que estaba antes queda fuera la
 * próxima vez que revise. Si la base todavía no tiene esta función (antes de supabase/dispositivo.sql), no hace nada.
 */
export async function usarEsteDispositivo(): Promise<void> {
  try {
    await (await cliente()).rpc('usar_este_dispositivo', { p_id: idDispositivo() })
  } catch {
    // Sin conexión: se intenta de nuevo la próxima vez.
  }
}

/** Link de WhatsApp con un mensaje listo, si el contacto es un número (si no, `null` y se muestra como texto). */
export function enlaceWhatsapp(contacto: string, texto: string): string | null {
  const numero = contacto.replace(/[^\d]/g, '')
  return numero.length >= 8 ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}` : null
}

export async function datosVenta(): Promise<DatosVenta | null> {
  try {
    const { data } = await (await cliente()).from('ajustes_venta').select('*').eq('id', 1).maybeSingle()
    return (data as DatosVenta | null) ?? null
  } catch {
    return null
  }
}

const MENSAJES_REGISTRO: Record<string, string> = {
  'codigo-invalido': 'Ese código no existe. Revisa que esté bien escrito (por ejemplo, ZF-7K4M-Q2PX).',
  'codigo-usado': 'Ese código ya se usó. Cada código sirve para una sola cuenta.',
  'correo-existe': 'Ese correo ya tiene una cuenta. Ingresa con tu PIN.',
  'datos-invalidos': 'Revisa tus datos: nombre, correo y un PIN de 6 números.',
  'sin-configurar': 'El registro todavía no está habilitado. Pídele ayuda a quien te dio el código.',
}

/** Crea la cuenta en `api/registro` (código opcional: sin código parte en prueba). Lanza un Error con un mensaje para el usuario si no se pudo. */
export async function registrarConCodigo(nombre: string, correo: string, pin: string, codigo: string): Promise<void> {
  let r: Response
  try {
    r = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim(), correo: correo.trim(), pin, ...(codigo && { codigo }) }),
    })
  } catch {
    throw new Error('No hay conexión. Revisa tu internet e intenta de nuevo.')
  }
  if (r.ok) return
  const { error } = ((await r.json().catch(() => ({}))) ?? {}) as { error?: string }
  throw new Error(MENSAJES_REGISTRO[error ?? ''] ?? 'No pudimos crear la cuenta. Intenta de nuevo en un momento.')
}

// --- Administración (las reglas de Supabase solo dejan hacer esto a un admin) ---------------------------------------

async function tabla(nombre: string) {
  return (await cliente()).from(nombre)
}

function revisar<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  return data as T
}

export async function listarCuentas(): Promise<Cuenta[]> {
  return revisar(await (await tabla('cuentas')).select('*').order('creada_en', { ascending: false }))
}

export async function listarCodigos(): Promise<Codigo[]> {
  return revisar(await (await tabla('codigos')).select('*').order('creado_en', { ascending: false }))
}

export async function crearCodigo(tipo: Codigo['tipo'], dias: number, nota: string): Promise<string> {
  // Con 31^8 combinaciones es casi imposible que se repita; si pasa, se intenta con otro.
  for (let intento = 0; intento < 3; intento++) {
    const codigo = generarCodigo()
    const { error } = await (await tabla('codigos')).insert({ codigo, tipo, dias, nota })
    if (!error) return codigo
    if (error.code !== '23505') throw new Error(error.message)
  }
  throw new Error('No se pudo crear el código. Intenta de nuevo.')
}

export async function borrarCodigo(codigo: string): Promise<void> {
  revisar(await (await tabla('codigos')).delete().eq('codigo', codigo).is('usado_por', null))
}

export async function actualizarCuenta(
  uid: string,
  cambios: Partial<Pick<Cuenta, 'estado' | 'prueba_hasta' | 'activa_hasta' | 'nota' | 'activada_en'>>,
): Promise<void> {
  revisar(await (await tabla('cuentas')).update(cambios).eq('user_id', uid))
}

/** Períodos para activar una cuenta (`dias: null` = sin vencimiento). */
export const PERIODOS: { etiqueta: string; dias: number | null }[] = [
  { etiqueta: '1 mes', dias: 30 },
  { etiqueta: '3 meses', dias: 91 },
  { etiqueta: '6 meses', dias: 182 },
  { etiqueta: '1 año', dias: 365 },
  { etiqueta: 'Sin vencimiento', dias: null },
]

/**
 * Activa una cuenta por un período (al confirmar el pago). Si ya estaba activa con tiempo por delante, el período se
 * suma desde el vencimiento actual (renovar antes de tiempo no hace perder días).
 */
export async function activarPor(cuenta: Pick<Cuenta, 'user_id' | 'estado' | 'activa_hasta'>, dias: number | null): Promise<void> {
  const ahora = Date.now()
  const base = cuenta.estado === 'activa' && cuenta.activa_hasta ? Math.max(ahora, new Date(cuenta.activa_hasta).getTime()) : ahora
  return actualizarCuenta(cuenta.user_id, {
    estado: 'activa',
    activa_hasta: dias === null ? null : new Date(base + dias * 86_400_000).toISOString(),
    activada_en: new Date().toISOString(),
  })
}

/** Sigue esperando pago: prueba vencida, activa vencida o pendiente (en modo aporte voluntario, nadie). */
export function esperaPago(c: Pick<Cuenta, 'estado' | 'prueba_hasta' | 'activa_hasta'>, ahora = Date.now(), voluntario = false): boolean {
  if (voluntario) return false
  if (c.estado === 'pendiente') return true
  if (c.estado === 'prueba') return new Date(c.prueba_hasta ?? 0).getTime() <= ahora
  if (c.estado === 'activa') return !!c.activa_hasta && new Date(c.activa_hasta).getTime() <= ahora
  return false
}

/** Bytes que ocupa la base de datos (solo admin). `null` si la función no existe todavía o no se pudo consultar. */
export async function espacioUsado(): Promise<number | null> {
  try {
    const { data, error } = await (await cliente()).rpc('espacio_usado')
    return error || data == null ? null : Number(data)
  } catch {
    return null
  }
}

/** Uso de la app por cuenta (solo admin; ver supabase/uso.sql). Solo números, sin el detalle de los entrenos. */
export interface UsoCuenta {
  user_id: string
  ultimo_ingreso: string | null
  ultima_sync: string | null
  entrenos: number
  entrenos_30d: number
  ultimo_entreno: string | null
  evaluacion: boolean
}

/** `null` si la función todavía no existe en Supabase o no se pudo consultar. */
export async function usoCuentas(): Promise<Map<string, UsoCuenta> | null> {
  try {
    const { data, error } = await (await cliente()).rpc('uso_cuentas')
    if (error || !Array.isArray(data)) return null
    return new Map((data as UsoCuenta[]).map((u) => [u.user_id, u]))
  } catch {
    return null
  }
}

export async function guardarDatosVenta(datos: DatosVenta): Promise<void> {
  revisar(await (await tabla('ajustes_venta')).update(datos).eq('id', 1))
}
