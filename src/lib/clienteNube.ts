import type { SupabaseClient } from '@supabase/supabase-js'

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

/** ¿Hay una sesión guardada en este teléfono? Se revisa sin cargar Supabase (misma clave que `storageKey`). */
export function haySesionGuardada(): boolean {
  try {
    return localStorage.getItem('zanfit:sesion') !== null
  } catch {
    return false
  }
}
