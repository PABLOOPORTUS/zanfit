/// <reference types="node" />
/**
 * Función de Vercel: `POST /api/registro` `{ nombre, correo, pin, codigo? }`. Es la ÚNICA forma de crear una cuenta:
 * el registro público está cerrado en Supabase ("Allow new users to sign up" apagado).
 *
 * Sin código, la cuenta parte en PRUEBA por los días de `ajustes_venta.dias_prueba` (7 por defecto). Al vencer, la app
 * muestra los datos para pagar (WhatsApp del administrador) y el administrador la activa por un período desde la
 * pantalla de Administración. Con código (para regalar acceso):
 * 1. Revisa que el código exista y no se haya usado.
 * 2. Crea el usuario con la API de administración de Supabase (clave `service_role`, solo en la variable de entorno
 *    SUPABASE_SERVICE_ROLE_KEY de Vercel; nunca en la app ni en git).
 * 3. Marca el código como usado (si otro lo usó en el mismo instante, borra el usuario recién creado).
 * 4. Crea la fila en `cuentas`: "prueba" por N días o "activa" si el código es de compra.
 *
 * Errores: 400 datos o código inválidos, 409 correo ya registrado o código ya usado, 503 sin configurar.
 */
import { URL as URL_SUPABASE } from '../src/lib/configNube.js'
import { esCodigoValido, normalizarCodigo } from '../src/lib/codigos.js'

const json = (status: number, cuerpo: unknown) => new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json' } })

interface Codigo {
  codigo: string
  tipo: 'prueba' | 'compra'
  dias: number
  usado_por: string | null
}

export async function POST(request: Request): Promise<Response> {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!clave) return json(503, { error: 'sin-configurar' })
  const h = { apikey: clave, authorization: `Bearer ${clave}`, 'content-type': 'application/json' }
  const rest = (ruta: string, init: RequestInit = {}) => fetch(`${URL_SUPABASE}/rest/v1/${ruta}`, { ...init, headers: { ...h, ...init.headers } })
  const admin = (ruta: string, init: RequestInit = {}) => fetch(`${URL_SUPABASE}/auth/v1/admin/${ruta}`, { ...init, headers: h })

  let datos: { nombre?: unknown; correo?: unknown; pin?: unknown; codigo?: unknown }
  try {
    datos = (await request.json()) as typeof datos
  } catch {
    return json(400, { error: 'datos-invalidos' })
  }
  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim().slice(0, 40) : ''
  const correo = typeof datos.correo === 'string' ? datos.correo.trim().toLowerCase() : ''
  const pin = typeof datos.pin === 'string' ? datos.pin : ''
  const codigo = typeof datos.codigo === 'string' ? normalizarCodigo(datos.codigo) : ''
  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !/^\d{6}$/.test(pin)) return json(400, { error: 'datos-invalidos' })
  if (codigo && !esCodigoValido(codigo)) return json(400, { error: 'codigo-invalido' })

  // 1. Si trae código: que exista y no se haya usado.
  let c: Codigo | undefined
  if (codigo) {
    const filas = (await (await rest(`codigos?codigo=eq.${encodeURIComponent(codigo)}&select=codigo,tipo,dias,usado_por`)).json()) as Codigo[]
    c = filas[0]
    if (!c) return json(400, { error: 'codigo-invalido' })
    if (c.usado_por) return json(409, { error: 'codigo-usado' })
  }

  // 2. Crear el usuario (ya confirmado: no se manda correo de confirmación).
  const creado = await admin('users', {
    method: 'POST',
    body: JSON.stringify({ email: correo, password: pin, email_confirm: true, user_metadata: { nombre } }),
  })
  if (!creado.ok) {
    const texto = (await creado.text()).toLowerCase()
    if (creado.status === 422 || texto.includes('already')) return json(409, { error: 'correo-existe' })
    return json(502, { error: 'no-se-pudo-crear' })
  }
  const usuario = (await creado.json()) as { id: string }
  const borrarUsuario = () => admin(`users/${usuario.id}`, { method: 'DELETE' })

  // 3. Marcar el código como usado, solo si nadie lo usó entremedio.
  const canje = !c
    ? null
    : await rest(`codigos?codigo=eq.${encodeURIComponent(codigo)}&usado_por=is.null`, {
        method: 'PATCH',
        headers: { prefer: 'return=representation' },
        body: JSON.stringify({ usado_por: usuario.id, usado_en: new Date().toISOString() }),
      })
  if (canje && (!canje.ok || ((await canje.json()) as unknown[]).length === 0)) {
    await borrarUsuario()
    return json(409, { error: 'codigo-usado' })
  }

  // 4. La cuenta: sin código, prueba con los días de los ajustes de venta; con código, prueba por N días o activa (compra).
  const estado = c?.tipo === 'compra' ? 'activa' : 'prueba'
  let dias = c?.dias ?? 7
  if (!c) {
    const ajustes = (await (await rest('ajustes_venta?id=eq.1&select=dias_prueba')).json().catch(() => [])) as { dias_prueba?: number }[]
    dias = ajustes[0]?.dias_prueba ?? 7
  }
  const cuenta = await rest('cuentas', {
    method: 'POST',
    body: JSON.stringify({
      user_id: usuario.id,
      nombre,
      correo,
      estado,
      codigo: codigo || null,
      prueba_hasta: estado === 'prueba' ? new Date(Date.now() + dias * 86_400_000).toISOString() : null,
      activada_en: estado === 'activa' ? new Date().toISOString() : null,
    }),
  })
  if (!cuenta.ok) {
    await borrarUsuario()
    if (c)
      await rest(`codigos?codigo=eq.${encodeURIComponent(codigo)}`, { method: 'PATCH', body: JSON.stringify({ usado_por: null, usado_en: null }) })
    return json(502, { error: 'no-se-pudo-crear' })
  }
  return json(200, { ok: true, estado })
}
