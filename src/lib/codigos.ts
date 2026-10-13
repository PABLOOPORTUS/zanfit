/**
 * Códigos de activación (de prueba o de compra). Lo usan la app (pantalla de Administración y Crear cuenta) y el
 * servidor (api/registro.ts), así que no puede importar nada más.
 */

/** Sin letras ni números que se confundan al dictarlos o copiarlos (0/O, 1/I/L). */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Código nuevo con el formato ZF-XXXX-XXXX (31^8 combinaciones: imposible de adivinar probando). */
export function generarCodigo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  const letras = [...bytes].map((b) => ALFABETO[b % ALFABETO.length]).join('')
  return `ZF-${letras.slice(0, 4)}-${letras.slice(4)}`
}

/**
 * Acepta el código con o sin guiones, con espacios o en minúsculas: "zf 7k4m q2px" → "ZF-7K4M-Q2PX". Los códigos
 * personalizados (creados a mano en Supabase, como "ZF-PABLO-2026") solo se pasan a mayúsculas y sin espacios.
 */
export function normalizarCodigo(texto: string): string {
  const limpio = texto.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^ZF/, '')
  return limpio.length === 8 ? `ZF-${limpio.slice(0, 4)}-${limpio.slice(4)}` : texto.toUpperCase().replace(/\s+/g, '')
}

/** Los generados son ZF-XXXX-XXXX; también se aceptan personalizados de 4 a 30 letras, números o guiones. */
export const esCodigoValido = (codigo: string) => /^[A-Z0-9][A-Z0-9-]{3,29}$/.test(codigo)
