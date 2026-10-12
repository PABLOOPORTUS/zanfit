/**
 * Proyecto de Supabase. La URL y la clave `anon` son públicas por diseño: la seguridad la dan las políticas RLS de la
 * tabla (ver supabase/esquema.sql). Nunca poner aquí la clave `service_role`.
 * Lo usan la app (lib/supabase.ts) y la función del servidor (api/plan-ia.ts), donde no existe `import.meta.env`.
 */
const env = (import.meta as { env?: Record<string, string | undefined> }).env

export const URL = env?.VITE_SUPABASE_URL ?? 'https://pjjjfonkccmhrswujysy.supabase.co'
export const CLAVE_ANON =
  env?.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqampmb25rY2NtaHJzd3VqeXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MjE2MTAsImV4cCI6MjEwNzM5NzYxMH0.ywwzXY17YC2R_QvC_SpeiplwgMlYWLfvJRjcaDcJ5ms'
