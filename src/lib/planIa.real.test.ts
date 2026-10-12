import { expect, it, vi } from 'vitest'
import { EJERCICIOS_BASE } from '../db/ejerciciosBase'
import { EJERCICIOS_EXTRA } from '../db/ejerciciosExtra'
import { generarPlan, pedidoIa } from './plan'
import type { Exercise, Perfil } from '../types'

declare const process: { env: Record<string, string | undefined> }
const C: Exercise[] = [...EJERCICIOS_BASE, ...EJERCICIOS_EXTRA].map((e, i) => ({ ...e, id: i + 1, propio: false }))
const porId = new Map(C.map((e) => [e.id!, e]))
const perfil: Perfil = { id: 'general', sexo: 'mujer', anioNacimiento: 1990, pesoKg: 62, alturaCm: 165, objetivo: 'grasa', zonas: ['piernas-gluteos'], experiencia: 'principiante', lugar: 'casa', equipamiento: ['mancuernas', 'banda'], diasPorSemana: 3, minutosPorSesion: 45, lesiones: ['munecas'], precaucion: false, actualizadoEn: 0 }
/**
 * Prueba con Gemini de verdad (gasta cuota): solo corre si hay clave.
 * `GEMINI_API_KEY=$(cat ~/.zanfit-gemini) npx vitest run src/lib/planIa.real.test.ts --silent=false --reporter=verbose`
 */
it.skipIf(!process.env.GEMINI_API_KEY)('Gemini real arma un plan válido', { timeout: 300000 }, async () => {
  const fetchReal = globalThis.fetch
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (String(url).includes('/auth/v1/user')) return new Response('{}')
    const r = await fetchReal(url, init)
    console.log('   →', /models\/([^:]+)/.exec(String(url))?.[1], r.status)
    return r
  })
  const pedido = pedidoIa(perfil, generarPlan(perfil, C), C)
  const { POST } = await import('../../api/plan-ia')
  const t0 = Date.now()
  const r = await POST(new Request('http://x', { method: 'POST', headers: { authorization: 'Bearer x' }, body: JSON.stringify(pedido) }))
  const j = (await r.json()) as { dias?: { dayName: string; focus: string; note: string; exercises: { id: number; sets: number; reps: number; restSeconds: number; note: string }[] }[]; modelo?: string; error?: string; detalle?: string }
  console.log(`\n##### HTTP ${r.status} en ${((Date.now() - t0) / 1000).toFixed(1)} s · modelo ${j.modelo ?? '-'} ${j.error ?? ''} ${j.detalle ?? ''}`)
  for (const d of j.dias ?? []) {
    console.log(`\n${d.dayName} — ${d.focus}\n  "${d.note}"`)
    for (const e of d.exercises) console.log(`  • ${porId.get(e.id)!.nombre} [${porId.get(e.id)!.equipo}] ${e.sets}×${e.reps}, ${e.restSeconds} s — ${e.note}`)
  }
  expect(r.status).toBe(200)
})
