/** Cloudflare Pages Functions: `POST /api/plan-ia` (ver api/plan-ia.ts y functions/api/_entorno.ts). */
import { conEntorno, type Contexto } from './_entorno'

export const onRequestPost = (c: Contexto) => conEntorno(c, () => import('../../api/plan-ia'))
