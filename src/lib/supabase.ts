import { createClient } from '@supabase/supabase-js'

/**
 * La URL y la clave `anon` son públicas por diseño: la seguridad la dan las políticas RLS de la tabla
 * (ver supabase/esquema.sql). Nunca poner aquí la clave `service_role`.
 */
const URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://pjjjfonkccmhrswujysy.supabase.co'
const CLAVE_ANON =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqampmb25rY2NtaHJzd3VqeXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MjE2MTAsImV4cCI6MjEwNzM5NzYxMH0.ywwzXY17YC2R_QvC_SpeiplwgMlYWLfvJRjcaDcJ5ms'

export const supabase = createClient(URL, CLAVE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'zanfit:sesion' },
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
