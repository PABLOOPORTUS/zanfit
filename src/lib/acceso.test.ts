import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../../api/registro'
import { diasRestantes, esperaPago, puedeUsar } from './acceso'
import { esCodigoValido, generarCodigo, normalizarCodigo } from './codigos'

declare const process: { env: Record<string, string | undefined> }

describe('códigos', () => {
  it('genera códigos ZF-XXXX-XXXX sin caracteres confusos', () => {
    for (let i = 0; i < 200; i++) {
      const c = generarCodigo()
      expect(esCodigoValido(c)).toBe(true)
      expect(c.slice(3)).not.toMatch(/[01OIL]/)
    }
  })
  it('normaliza lo que escribe la persona', () => {
    expect(normalizarCodigo('zf 7k4m q2px')).toBe('ZF-7K4M-Q2PX')
    expect(normalizarCodigo('7K4MQ2PX')).toBe('ZF-7K4M-Q2PX')
    expect(normalizarCodigo(' ZF-7K4M-Q2PX ')).toBe('ZF-7K4M-Q2PX')
  })
  it('acepta códigos personalizados creados a mano', () => {
    expect(normalizarCodigo('zf-pablo-2026')).toBe('ZF-PABLO-2026')
    expect(esCodigoValido('ZF-PABLO-2026')).toBe(true)
    expect(esCodigoValido('ab')).toBe(false)
    expect(esCodigoValido("ZF'; drop table")).toBe(false)
  })
})

describe('acceso', () => {
  const ahora = Date.UTC(2026, 9, 12)
  it('activa siempre puede; prueba solo hasta su fecha; bloqueada y sin cuenta, no', () => {
    expect(puedeUsar({ estado: 'activa', pruebaHasta: null }, ahora)).toBe(true)
    expect(puedeUsar({ estado: 'prueba', pruebaHasta: ahora + 1000 }, ahora)).toBe(true)
    expect(puedeUsar({ estado: 'prueba', pruebaHasta: ahora - 1000 }, ahora)).toBe(false)
    expect(puedeUsar({ estado: 'bloqueada', pruebaHasta: null }, ahora)).toBe(false)
    expect(puedeUsar({ estado: 'sin-cuenta', pruebaHasta: null }, ahora)).toBe(false)
    expect(puedeUsar({ estado: 'pendiente', pruebaHasta: null }, ahora)).toBe(false)
  })
  it('una suscripción activa con fecha de término deja de servir al vencer', () => {
    expect(puedeUsar({ estado: 'activa', pruebaHasta: null, activaHasta: ahora + 1000 }, ahora)).toBe(true)
    expect(puedeUsar({ estado: 'activa', pruebaHasta: null, activaHasta: ahora - 1000 }, ahora)).toBe(false)
    expect(puedeUsar({ estado: 'activa', pruebaHasta: null, activaHasta: null }, ahora)).toBe(true)
  })
  it('esperaPago: prueba o período vencido, o pendiente', () => {
    const iso = (ms: number) => new Date(ms).toISOString()
    expect(esperaPago({ estado: 'prueba', prueba_hasta: iso(ahora - 1), activa_hasta: null }, ahora)).toBe(true)
    expect(esperaPago({ estado: 'prueba', prueba_hasta: iso(ahora + 1e6), activa_hasta: null }, ahora)).toBe(false)
    expect(esperaPago({ estado: 'activa', prueba_hasta: null, activa_hasta: iso(ahora - 1) }, ahora)).toBe(true)
    expect(esperaPago({ estado: 'activa', prueba_hasta: null, activa_hasta: null }, ahora)).toBe(false)
    expect(esperaPago({ estado: 'pendiente', prueba_hasta: null, activa_hasta: null }, ahora)).toBe(true)
  })
  it('cuenta los días que quedan hacia arriba', () => {
    expect(diasRestantes(ahora + 6.2 * 86_400_000, ahora)).toBe(7)
    expect(diasRestantes(ahora - 1, ahora)).toBe(0)
  })
})

describe('api/registro (Supabase simulado)', () => {
  type Codigo = { codigo: string; tipo: 'prueba' | 'compra'; dias: number; usado_por: string | null }
  const simular = (codigos: Codigo[], { correoExiste = false, robado = false } = {}) => {
    const llamadas: { metodo: string; url: string; cuerpo?: unknown }[] = []
    vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
      const metodo = init.method ?? 'GET'
      const cuerpo = init.body ? JSON.parse(String(init.body)) : undefined
      llamadas.push({ metodo, url, cuerpo })
      if (url.includes('/rest/v1/codigos') && metodo === 'GET') {
        const codigo = decodeURIComponent(/codigo=eq\.([^&]+)/.exec(url)![1])
        return new Response(JSON.stringify(codigos.filter((c) => c.codigo === codigo)))
      }
      if (url.endsWith('/auth/v1/admin/users') && metodo === 'POST')
        return correoExiste ? new Response('{"msg":"User already registered"}', { status: 422 }) : new Response(JSON.stringify({ id: 'u-nuevo' }))
      if (url.includes('/rest/v1/codigos') && metodo === 'PATCH') return new Response(JSON.stringify(robado ? [] : [{}]))
      if (url.includes('/rest/v1/cuentas')) return new Response('', { status: 201 })
      if (url.includes('/rest/v1/ajustes_venta')) return new Response(JSON.stringify([{ dias_prueba: 10 }]))
      if (url.includes('/auth/v1/admin/users/') && metodo === 'DELETE') return new Response('{}')
      return new Response('{}', { status: 404 })
    })
    return llamadas
  }
  const registrar = (datos: Record<string, string>) =>
    POST(new Request('http://x/api/registro', { method: 'POST', body: JSON.stringify({ nombre: 'Ana', correo: 'ana@correo.cl', pin: '123456', ...datos }) }))
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  it('sin la clave de servicio configurada responde 503', async () => {
    expect((await registrar({ codigo: 'ZF-AAAA-BBBB' })).status).toBe(503)
  })
  it('rechaza un código que no existe o mal escrito', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    simular([])
    expect((await registrar({ codigo: 'ZF-AAAA-BBBB' })).status).toBe(400)
    expect((await registrar({ codigo: 'hola' })).status).toBe(400)
  })
  it('sin código crea la cuenta en prueba con los días de los ajustes de venta', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    const llamadas = simular([])
    const r = await POST(new Request('http://x/api/registro', { method: 'POST', body: JSON.stringify({ nombre: 'Ana', correo: 'ana@correo.cl', pin: '123456' }) }))
    expect(r.status).toBe(200)
    const cuenta = llamadas.find((l) => l.url.includes('/rest/v1/cuentas'))!.cuerpo as { estado: string; prueba_hasta: string; codigo: null }
    expect(cuenta.estado).toBe('prueba')
    expect(cuenta.codigo).toBeNull()
    expect(Math.round((new Date(cuenta.prueba_hasta).getTime() - Date.now()) / 86_400_000)).toBe(10)
    expect(llamadas.some((l) => l.metodo === 'PATCH')).toBe(false)
  })
  it('rechaza un código ya usado sin crear el usuario', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    const llamadas = simular([{ codigo: 'ZF-AAAA-BBBB', tipo: 'compra', dias: 7, usado_por: 'otro' }])
    const r = await registrar({ codigo: 'zf aaaa bbbb' })
    expect(r.status).toBe(409)
    expect(llamadas.some((l) => l.url.includes('/admin/users'))).toBe(false)
  })
  it('con código de prueba crea la cuenta en prueba por N días', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    const llamadas = simular([{ codigo: 'ZF-AAAA-BBBB', tipo: 'prueba', dias: 7, usado_por: null }])
    const r = await registrar({ codigo: 'ZF-AAAA-BBBB' })
    expect(r.status).toBe(200)
    const cuenta = llamadas.find((l) => l.url.includes('/rest/v1/cuentas'))!.cuerpo as { estado: string; prueba_hasta: string }
    expect(cuenta.estado).toBe('prueba')
    const dias = (new Date(cuenta.prueba_hasta).getTime() - Date.now()) / 86_400_000
    expect(dias).toBeGreaterThan(6.9)
    expect(dias).toBeLessThan(7.1)
  })
  it('con código de compra crea la cuenta activa', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    const llamadas = simular([{ codigo: 'ZF-AAAA-BBBB', tipo: 'compra', dias: 7, usado_por: null }])
    expect((await registrar({ codigo: 'ZF-AAAA-BBBB' })).status).toBe(200)
    expect((llamadas.find((l) => l.url.includes('/rest/v1/cuentas'))!.cuerpo as { estado: string }).estado).toBe('activa')
  })
  it('si el correo ya existe responde 409 y no gasta el código', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    const llamadas = simular([{ codigo: 'ZF-AAAA-BBBB', tipo: 'compra', dias: 7, usado_por: null }], { correoExiste: true })
    expect((await registrar({ codigo: 'ZF-AAAA-BBBB' })).status).toBe(409)
    expect(llamadas.some((l) => l.metodo === 'PATCH')).toBe(false)
  })
  it('si otro usó el código en el mismo instante, borra el usuario recién creado', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    const llamadas = simular([{ codigo: 'ZF-AAAA-BBBB', tipo: 'compra', dias: 7, usado_por: null }], { robado: true })
    expect((await registrar({ codigo: 'ZF-AAAA-BBBB' })).status).toBe(409)
    expect(llamadas.some((l) => l.metodo === 'DELETE' && l.url.includes('/admin/users/u-nuevo'))).toBe(true)
    expect(llamadas.some((l) => l.url.includes('/rest/v1/cuentas'))).toBe(false)
  })
  it('valida nombre, correo y PIN', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    simular([{ codigo: 'ZF-AAAA-BBBB', tipo: 'compra', dias: 7, usado_por: null }])
    expect((await registrar({ codigo: 'ZF-AAAA-BBBB', pin: '12a456' })).status).toBe(400)
    expect((await registrar({ codigo: 'ZF-AAAA-BBBB', correo: 'no-es-correo' })).status).toBe(400)
    expect((await registrar({ codigo: 'ZF-AAAA-BBBB', nombre: '  ' })).status).toBe(400)
  })
})
