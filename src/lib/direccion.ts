/**
 * Dirección oficial de la app: fit.zan.cl (dominio propio, sobre el mismo proyecto de Cloudflare Pages). Antes estuvo
 * en Vercel (su plan gratis no permite uso comercial) y en zanfit.pages.dev. En una dirección antigua, `<AvisoMudanza>`
 * lleva a la nueva (con `MUDANZA_ACTIVA`).
 */
export const DIRECCION = 'https://fit.zan.cl'
export const DIRECCIONES_ANTIGUAS = ['zanfit.vercel.app', 'zanfit.pages.dev']
/** Se activa recién cuando la dirección nueva está funcionando. */
export const MUDANZA_ACTIVA = true

export const enDireccionAntigua = () => MUDANZA_ACTIVA && DIRECCIONES_ANTIGUAS.includes(location.hostname)
