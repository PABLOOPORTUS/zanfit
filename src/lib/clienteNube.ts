import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Supabase pesa ~300 kB: se carga en un chunk aparte y solo cuando hace falta (hay una sesión guardada o alguien va a
 * ingresar). Sin cuenta, la app no lo descarga nunca al abrir.
 */
let promesa: Promise<SupabaseClient> | null = null

export function cliente(): Promise<SupabaseClient> {
  promesa ??= import('./supabase').then((m) => m.supabase)
  return promesa
}

export async function mensajeErrorNube(error: { message?: string; status?: number } | null | undefined): Promise<string> {
  return (await import('./supabase')).mensajeError(error)
}

/**
 * Usuario de la sesión guardada en este teléfono, leído sin cargar Supabase (misma clave que `storageKey`).
 * Permite entrar sin internet: en el gimnasio muchas veces no hay señal.
 */
export function usuarioGuardado(): User | null {
  try {
    const sesion = JSON.parse(localStorage.getItem('zanfit:sesion') ?? 'null') as { user?: User } | null
    return sesion?.user?.id ? sesion.user : null
  } catch {
    return null
  }
}
