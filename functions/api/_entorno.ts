/**
 * Puente entre Cloudflare Pages Functions y los manejadores de api/ (escritos para Vercel: `POST(request)` y
 * `process.env`). Cloudflare entrega las variables de entorno en `context.env`; se copian a `process.env` antes de
 * cargar el manejador. Los archivos con `_` no son rutas.
 */
export interface Contexto {
  request: Request
  env: Record<string, unknown>
}

type Manejador = { POST: (r: Request) => Promise<Response> }

export async function conEntorno(c: Contexto, cargar: () => Promise<Manejador>): Promise<Response> {
  const global = globalThis as unknown as { process?: { env: Record<string, string | undefined> } }
  global.process ??= { env: {} }
  for (const [clave, valor] of Object.entries(c.env)) if (typeof valor === 'string') global.process.env[clave] = valor
  return (await cargar()).POST(c.request)
}
