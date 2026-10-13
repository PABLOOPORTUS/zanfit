/**
 * Identificador de este teléfono (o navegador): se crea una vez y queda en localStorage. Sirve para que una cuenta se
 * use en un solo teléfono a la vez (ver supabase/dispositivo.sql). Ojo: en iPhone, Safari y la app del ícono guardan
 * sus datos por separado, así que cuentan como dos teléfonos distintos.
 */
const CLAVE = 'zanfit:dispositivo'
let enMemoria: string | null = null

export function idDispositivo(): string {
  if (enMemoria) return enMemoria
  try {
    enMemoria = localStorage.getItem(CLAVE)
    if (!enMemoria) {
      enMemoria = crypto.randomUUID()
      localStorage.setItem(CLAVE, enMemoria)
    }
  } catch {
    // Sin localStorage: un id por sesión (cada vez que abra la app tendrá que tocar "Usar aquí").
    enMemoria ??= crypto.randomUUID()
  }
  return enMemoria
}
