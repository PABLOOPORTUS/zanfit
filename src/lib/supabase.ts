import { createClient } from '@supabase/supabase-js'
import { CLAVE_ANON, URL } from './configNube'
import { idDispositivo } from './dispositivo'

export const supabase = createClient(URL, CLAVE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'zanfit:sesion' },
  // La nube solo acepta guardar datos desde el teléfono activo de la cuenta (ver supabase/dispositivo.sql).
  global: { headers: { 'x-dispositivo': idDispositivo() } },
})

/** Traduce los errores de Supabase Auth a mensajes para el usuario. */
export function mensajeError(error: { message?: string; status?: number } | null | undefined): string {
  const m = error?.message?.toLowerCase() ?? ''
  if (m.includes('invalid login credentials')) return 'Correo o PIN incorrecto.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ese correo ya tiene una cuenta. Ingresa con tu PIN.'
  if (m.includes('email not confirmed')) return 'Tu correo todavía no está confirmado. Revisa tu bandeja de entrada.'
  if (m.includes('rate limit') || m.includes('security purposes') || error?.status === 429)
    return 'Demasiados intentos. Espera unos minutos y vuelve a intentar.'
  if (m.includes('valid email') || m.includes('invalid format')) return 'Revisa el correo: no parece válido.'
  if (m.includes('password')) return 'El PIN no es válido. Debe tener 6 números.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'No hay conexión. Revisa tu internet e intenta de nuevo.'
  return 'Algo salió mal. Intenta de nuevo en un momento.'
}
