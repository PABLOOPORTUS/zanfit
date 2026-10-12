/// <reference types="node" />
/**
 * Función de Vercel: `POST /api/plan-ia`. Recibe un `PedidoIa` (lib/planIa.ts), le pide a Gemini que elija y ordene
 * ejercicios entre los candidatos y devuelve `{ dias }` ya validados.
 *
 * - La clave de Gemini vive solo aquí, en la variable de entorno GEMINI_API_KEY (Vercel → Settings → Environment
 *   Variables; en local, en `.env`, que no se sube a git). Nunca llega al teléfono.
 * - Solo atiende a usuarios con sesión en ZANFIT (token de Supabase), para que nadie más gaste la cuota gratuita.
 * - Si la respuesta no pasa la validación, reintenta una vez. Errores: 401 sin sesión, 429 límite de Gemini,
 *   422 respuesta inválida dos veces, 503 sin clave configurada o ningún modelo disponible, 502 otros errores de Gemini.
 *   En todos esos casos la app se queda con el plan por reglas.
 * - Modelos: GEMINI_MODEL acepta una lista separada por comas. Si uno está saturado (503), no existe para esta clave
 *   (404) o falla (500), se prueba el siguiente.
 */
import { CLAVE_ANON, URL as URL_SUPABASE } from '../src/lib/configNube'
import { construirPrompt, ESQUEMA_RESPUESTA, validarRespuesta, type PedidoIa } from '../src/lib/planIa'

// Los lite primero: en las pruebas de octubre de 2026 eran los más disponibles en el plan gratuito (los Flash normales
// solían responder 503 por demanda) y contestan en ~4 s. Ver CLAUDE.md.
const MODELOS = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.5-flash').split(',').map((m) => m.trim()).filter(Boolean)
/** Respuestas de Gemini que justifican probar con otro modelo. */
const PROBAR_OTRO = new Set([404, 408, 500, 503, 504])
/** Un modelo saturado puede tardar minutos en contestar que no puede: se corta antes y se prueba el siguiente. */
const ESPERA_POR_LLAMADA = 15_000
const json = (status: number, cuerpo: unknown) => new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json' } })

async function usuarioValido(autorizacion: string | null): Promise<boolean> {
  if (!autorizacion?.startsWith('Bearer ')) return false
  const r = await fetch(`${URL_SUPABASE}/auth/v1/user`, { headers: { apikey: CLAVE_ANON, Authorization: autorizacion } })
  return r.ok
}

function pedidoValido(p: unknown): p is PedidoIa {
  const x = p as PedidoIa
  return (
    !!x?.perfil &&
    !!x.rangos &&
    Array.isArray(x.dias) &&
    x.dias.length >= 1 &&
    x.dias.length <= 6 &&
    x.dias.every((d) => Array.isArray(d.candidatos) && d.candidatos.length <= 80 && Array.isArray(d.base))
  )
}

async function llamarGemini(clave: string, modelo: string, prompt: string): Promise<{ status: number; datos?: unknown }> {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': clave },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: ESQUEMA_RESPUESTA, temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(ESPERA_POR_LLAMADA),
  }).catch(() => null)
  if (!r) return { status: 408 }
  if (!r.ok) return { status: r.status }
  const cuerpo = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const texto = cuerpo.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  try {
    return { status: 200, datos: JSON.parse(texto) }
  } catch {
    return { status: 200, datos: null }
  }
}

export async function POST(request: Request): Promise<Response> {
  const clave = process.env.GEMINI_API_KEY
  if (!clave) return json(503, { error: 'sin-clave' })
  if (!(await usuarioValido(request.headers.get('authorization')))) return json(401, { error: 'sin-sesion' })

  let pedido: unknown
  try {
    pedido = await request.json()
  } catch {
    return json(400, { error: 'pedido-invalido' })
  }
  if (!pedidoValido(pedido)) return json(400, { error: 'pedido-invalido' })

  const prompt = construirPrompt(pedido)
  let ultimoError = ''
  let intentos = 0
  let limite = false
  for (const modelo of MODELOS) {
    // Hasta 2 respuestas por modelo (la segunda, pidiéndole corregir la primera), y 2 respuestas inválidas en total.
    while (intentos < 2) {
      const { status, datos } = await llamarGemini(clave, modelo, intentos === 0 ? prompt : `${prompt}\n\nTu respuesta anterior no era válida (${ultimoError}). Corrígela.`)
      if (status === 429) {
        limite = true
        break // cuota de este modelo agotada: se prueba el siguiente
      }
      if (PROBAR_OTRO.has(status)) break
      if (status !== 200) return json(502, { error: `gemini-${status}` })
      const validacion = validarRespuesta(pedido, datos)
      if (validacion.ok) return json(200, { dias: validacion.dias, modelo })
      ultimoError = validacion.error
      intentos++
    }
    if (intentos >= 2) return json(422, { error: 'respuesta-invalida', detalle: ultimoError })
  }
  return limite ? json(429, { error: 'limite' }) : json(503, { error: 'sin-modelo-disponible' })
}
