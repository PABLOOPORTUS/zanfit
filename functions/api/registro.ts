/**
 * Cloudflare Pages Functions: `POST /api/registro`. Adapta el manejador de api/registro.ts (que lee `process.env`, como
 * en Vercel) a Cloudflare, donde las variables vienen en `env`. Se importa después de copiar `env`, porque el módulo
 * puede leer variables al cargarse.
 */
import { conEntorno, type Contexto } from './_entorno'

export const onRequestPost = (c: Contexto) => conEntorno(c, () => import('../../api/registro'))
