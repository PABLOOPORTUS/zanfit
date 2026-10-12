import { cliente, usuarioGuardado } from './clienteNube'
import { validarRespuesta, type DiaIa, type PedidoIa } from './planIa'

export type MotivoSinIa = 'sin-conexion' | 'sin-sesion' | 'limite' | 'invalida' | 'no-disponible' | 'error'
export type ResultadoIa = { ok: true; dias: DiaIa[] } | { ok: false; motivo: MotivoSinIa }

export const MENSAJE_SIN_IA: Record<MotivoSinIa, string> = {
  'sin-conexion': 'Sin conexión: armamos tu plan con nuestras reglas. Puedes ajustarlo con IA cuando tengas internet.',
  'sin-sesion': 'Tu sesión venció: armamos tu plan con nuestras reglas.',
  limite: 'La IA está con mucha demanda en este momento: armamos tu plan con nuestras reglas. Intenta ajustarlo más tarde.',
  invalida: 'La IA no dio una respuesta confiable: armamos tu plan con nuestras reglas.',
  'no-disponible': 'La IA no está disponible por ahora: armamos tu plan con nuestras reglas.',
  error: 'No pudimos usar la IA: armamos tu plan con nuestras reglas.',
}

/**
 * Pide a `api/plan-ia` que elija y ordene los ejercicios. Nunca lanza: si algo falla devuelve el motivo y la app se
 * queda con el plan por reglas. La respuesta se vuelve a validar aquí.
 */
export async function pedirPlanIa(pedido: PedidoIa, espera = 50_000): Promise<ResultadoIa> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { ok: false, motivo: 'sin-conexion' }
  if (!usuarioGuardado()) return { ok: false, motivo: 'sin-sesion' }
  try {
    const { data } = await (await cliente()).auth.getSession()
    const token = data.session?.access_token
    if (!token) return { ok: false, motivo: 'sin-sesion' }
    const r = await fetch('/api/plan-ia', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(pedido),
      signal: AbortSignal.timeout(espera),
    })
    if (r.status === 401) return { ok: false, motivo: 'sin-sesion' }
    if (r.status === 429) return { ok: false, motivo: 'limite' }
    if (r.status === 422) return { ok: false, motivo: 'invalida' }
    if (r.status === 503) {
      const { error } = ((await r.json().catch(() => ({}))) ?? {}) as { error?: string }
      return { ok: false, motivo: error === 'sin-modelo-disponible' ? 'limite' : 'no-disponible' }
    }
    if (!r.ok) return { ok: false, motivo: r.status === 404 ? 'no-disponible' : 'error' }
    const validacion = validarRespuesta(pedido, { days: ((await r.json()) as { dias?: unknown }).dias })
    return validacion.ok ? { ok: true, dias: validacion.dias } : { ok: false, motivo: 'invalida' }
  } catch (e) {
    return { ok: false, motivo: (e as Error)?.name === 'TimeoutError' || !navigator.onLine ? 'sin-conexion' : 'error' }
  }
}
