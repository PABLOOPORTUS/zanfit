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
    avisar.forEach((f) => f())
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

export type Plataforma = 'iphone-safari' | 'iphone-otro' | 'android' | 'computador'

export function plataforma(ua = navigator.userAgent): Plataforma {
  const iphone = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  if (iphone) return /CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV|WhatsApp|Line\/|GSA\//.test(ua) ? 'iphone-otro' : 'iphone-safari'
  if (/Android/.test(ua)) return 'android'
  return 'computador'
}
