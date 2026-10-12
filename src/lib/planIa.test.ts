import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../../api/plan-ia'
import { EJERCICIOS_BASE } from '../db/ejerciciosBase'
import { EJERCICIOS_EXTRA } from '../db/ejerciciosExtra'
import { clasificar } from './clasificacion'
import { aplicarIa, generarPlan, pedidoIa } from './plan'
import { validarRespuesta, type PedidoIa } from './planIa'
import type { Exercise, Perfil } from '../types'

declare const process: { env: Record<string, string | undefined> }

const CATALOGO: Exercise[] = [...EJERCICIOS_BASE, ...EJERCICIOS_EXTRA].map((e, i) => ({ ...e, id: i + 1, propio: false }))
const perfil: Perfil = {
  id: 'general',
  sexo: 'mujer',
  anioNacimiento: new Date().getFullYear() - 35,
  pesoKg: 60,
  alturaCm: 165,
  objetivo: 'musculo',
  zonas: ['piernas-gluteos'],
  experiencia: 'intermedio',
  lugar: 'gimnasio',
  diasPorSemana: 4,
  minutosPorSesion: 60,
  lesiones: ['hombros'],
  precaucion: false,
  actualizadoEn: 0,
}
const plan = generarPlan(perfil, CATALOGO)
const pedido = pedidoIa(perfil, plan, CATALOGO)

/** Una respuesta "buena" de la IA: los ejercicios base de cada día, en orden inverso. */
const respuestaValida = () => ({
  days: pedido.dias.map((d, i) => ({
    dayName: `Día ${i + 1}`,
    focus: d.foco,
    note: '¡Vamos con todo!',
    exercises: [...d.base].reverse().map((id) => ({ id, sets: 3, reps: 10, restSeconds: 75, note: 'Controla la bajada' })),
  })),
})

describe('pedido para la IA', () => {
  it('no manda datos personales (peso, edad, sexo, salud)', () => {
    const texto = JSON.stringify(pedido.perfil)
    expect(texto).not.toMatch(/pesoKg|anioNacimiento|sexo|alturaCm|salud/)
  })
  it('los candidatos ya vienen filtrados: con lesión de hombro, ningún press sobre la cabeza', () => {
    for (const d of pedido.dias) for (const c of d.candidatos) expect(c.patron, c.nombre).not.toBe('empuje-v')
  })
  it('incluye los ejercicios del plan por reglas entre los candidatos', () => {
    for (const d of pedido.dias) for (const id of d.base) expect(d.candidatos.map((c) => c.id)).toContain(id)
  })
})

describe('validarRespuesta', () => {
  it('acepta una respuesta correcta', () => {
    expect(validarRespuesta(pedido, respuestaValida()).ok).toBe(true)
  })
  it('rechaza ids inventados', () => {
    const r = respuestaValida()
    r.days[0].exercises[0].id = 999999
    expect(validarRespuesta(pedido, r)).toMatchObject({ ok: false })
  })
  it('rechaza ejercicios repetidos en un día', () => {
    const r = respuestaValida()
    r.days[0].exercises[1].id = r.days[0].exercises[0].id
    expect(validarRespuesta(pedido, r)).toMatchObject({ ok: false })
  })
  it('rechaza si faltan días o el formato es otro', () => {
    expect(validarRespuesta(pedido, { days: respuestaValida().days.slice(1) }).ok).toBe(false)
    expect(validarRespuesta(pedido, { foo: 1 }).ok).toBe(false)
    expect(validarRespuesta(pedido, null).ok).toBe(false)
  })
  it('ajusta al rango series, reps y descansos fuera de rango', () => {
    const r = respuestaValida()
    Object.assign(r.days[0].exercises[0], { sets: 12, reps: 1, restSeconds: 900 })
    const v = validarRespuesta(pedido, r)
    if (!v.ok) throw new Error(v.error)
    const e = v.dias[0].exercises[0]
    expect(e.sets).toBeLessThanOrEqual(4)
    expect(e.reps).toBeGreaterThanOrEqual(8)
    expect(e.restSeconds).toBeLessThanOrEqual(90)
  })
})

describe('aplicarIa', () => {
  it('usa los ejercicios de la IA, con compuestos primero, notas y peso sugerido', () => {
    const v = validarRespuesta(pedido, respuestaValida())
    if (!v.ok) throw new Error(v.error)
    const nuevo = aplicarIa(perfil, plan, v.dias, CATALOGO)
    expect(nuevo.origen).toBe('ia')
    expect(nuevo.dias[0].nota).toBe('¡Vamos con todo!')
    const compuestos = ['sentadilla', 'bisagra', 'empuje-h', 'empuje-v', 'tiron-v', 'tiron-h']
    for (const d of nuevo.dias) {
      const es = d.ejercicios.map((x) => compuestos.includes(clasificar(CATALOGO[x.exerciseId - 1])!.patron))
      expect(es.indexOf(false) === -1 || es.lastIndexOf(true) < es.indexOf(false)).toBe(true)
      expect(d.calentamiento.length).toBeGreaterThan(0)
    }
    expect(nuevo.dias[0].ejercicios[0].nota).toBe('Controla la bajada')
  })
})

describe('api/plan-ia (Gemini simulado)', () => {
  const llamada = (cuerpo: unknown = pedido, token = 'Bearer abc') =>
    POST(new Request('http://x/api/plan-ia', { method: 'POST', headers: { authorization: token, 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) }))
  const gemini = (respuestas: { status: number; json?: unknown }[]) => {
    const cola = [...respuestas]
    return vi.fn(async (url: string) => {
      if (url.includes('/auth/v1/user')) return new Response('{}', { status: 200 })
      const r = cola.shift()!
      const cuerpo = r.json === undefined ? '{}' : JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(r.json) }] } }] })
      return new Response(cuerpo, { status: r.status })
    })
  }
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.GEMINI_API_KEY
  })

  it('sin clave configurada responde 503 (la app usa las reglas)', async () => {
    expect((await llamada()).status).toBe(503)
  })
  it('sin sesión válida responde 401 y no llama a Gemini', async () => {
    process.env.GEMINI_API_KEY = 'x'
    const f = vi.fn(async () => new Response('{}', { status: 401 }))
    vi.stubGlobal('fetch', f)
    expect((await llamada(pedido, 'Bearer malo')).status).toBe(401)
    expect(f).toHaveBeenCalledTimes(1)
  })
  it('respuesta válida: 200 con los días', async () => {
    process.env.GEMINI_API_KEY = 'x'
    vi.stubGlobal('fetch', gemini([{ status: 200, json: respuestaValida() }]))
    const r = await llamada()
    expect(r.status).toBe(200)
    expect(((await r.json()) as { dias: unknown[] }).dias).toHaveLength(pedido.dias.length)
  })
  it('si la primera respuesta es inválida, reintenta una vez', async () => {
    process.env.GEMINI_API_KEY = 'x'
    const malo = respuestaValida()
    malo.days[0].exercises[0].id = 999999
    const f = gemini([{ status: 200, json: malo }, { status: 200, json: respuestaValida() }])
    vi.stubGlobal('fetch', f)
    expect((await llamada()).status).toBe(200)
    expect(f).toHaveBeenCalledTimes(3) // sesión + 2 intentos
  })
  it('si falla dos veces responde 422', async () => {
    process.env.GEMINI_API_KEY = 'x'
    vi.stubGlobal('fetch', gemini([{ status: 200, json: { days: [] } }, { status: 200, json: { days: [] } }]))
    expect((await llamada()).status).toBe(422)
  })
  it('el límite de Gemini (429) se devuelve tal cual', async () => {
    process.env.GEMINI_API_KEY = 'x'
    vi.stubGlobal('fetch', gemini([{ status: 429 }]))
    expect((await llamada()).status).toBe(429)
  })
  it('rechaza pedidos con otra forma', async () => {
    process.env.GEMINI_API_KEY = 'x'
    vi.stubGlobal('fetch', gemini([]))
    expect((await llamada({ hola: 1 } as unknown as PedidoIa)).status).toBe(400)
  })
})
