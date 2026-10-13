/**
 * Dirección oficial de la app. La app se mudó de Vercel (su plan gratis no permite uso comercial) a Cloudflare Pages.
 * En la dirección antigua, `<AvisoMudanza>` invita a ir a la nueva (con `MUDANZA_ACTIVA`).
 */
export const DIRECCION = 'https://zanfit.pages.dev'
export const DIRECCIONES_ANTIGUAS = ['zanfit.vercel.app']
/** Se activa recién cuando la dirección nueva está funcionando. */
export const MUDANZA_ACTIVA = false

export const enDireccionAntigua = () => MUDANZA_ACTIVA && DIRECCIONES_ANTIGUAS.includes(location.hostname)
