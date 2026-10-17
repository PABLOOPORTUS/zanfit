/**
 * Instalar la app (PWA) en el teléfono. Android/Chrome avisa que se puede instalar con el evento
 * `beforeinstallprompt`, que llega una sola vez y muy temprano: por eso se escucha apenas carga la app (main.tsx
 * importa este archivo) y se guarda para cuando la persona toque "Instalar". En iPhone no existe ese evento: hay que
 * hacerlo a mano desde Safari (Compartir → Agregar a pantalla de inicio).
 */

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let evento: EventoInstalacion | null = null
const avisar = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // sin la barra automática de Chrome: se muestra nuestro botón
    evento = e as EventoInstalacion
    avisar.forEach((f) => f())
  })
  window.addEventListener('appinstalled', () => {
    evento = null
    marcarInstalada()
  })
}

/** Se puede instalar con un toque (Android/Chrome). */
export const puedeInstalarDirecto = () => evento !== null

export function alCambiarInstalacion(f: () => void): () => void {
  avisar.add(f)
  return () => avisar.delete(f)
}

/** Abre el diálogo de instalación de Chrome. Devuelve `true` si la persona aceptó. */
export async function instalar(): Promise<boolean> {
  if (!evento) return false
  await evento.prompt()
  const { outcome } = await evento.userChoice
  evento = null
  return outcome === 'accepted'
}

/** Ya se está usando como app instalada (abierta desde el ícono). */
export const esInstalada = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

/**
 * - `iphone`: Safari (o Chrome/Firefox/Edge en iOS 16.4+, que también tienen "Agregar a pantalla de inicio").
 * - `app-interna`: el navegador de Instagram, Facebook, TikTok… (iPhone o Android), donde no se puede instalar.
 */
export type Plataforma = 'iphone' | 'android' | 'app-interna' | 'computador'

export function plataforma(ua = navigator.userAgent): Plataforma {
  if (/Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Line\//i.test(ua)) return 'app-interna'
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iphone'
  if (/Android/.test(ua)) return 'android'
  return 'computador'
}

const CLAVE = 'zanfit:instalada'

/** La persona tocó "Ya la instalé" (o Chrome avisó que se instaló): no se le vuelve a ofrecer. */
export function dijoQueLaInstalo(): boolean {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

export function marcarInstalada() {
  try {
    localStorage.setItem(CLAVE, '1')
  } catch {
    // Sin localStorage se le puede volver a ofrecer; no es grave.
  }
  avisar.forEach((f) => f())
}

/** Ofrecer instalar: en un teléfono, si no se abrió desde el ícono y no dijo que ya la instaló. */
export const ofrecerInstalar = () => plataforma() !== 'computador' && !esInstalada() && !dijoQueLaInstalo()
