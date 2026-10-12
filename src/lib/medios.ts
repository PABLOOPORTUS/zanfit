/**
 * Prepara fotos y videos grabados con el teléfono para guardarlos sin llenar la memoria:
 * fotos a JPEG de máx. 1280 px; videos recodificados a ~540 px de ancho, máx. 15 s, con MediaRecorder.
 * Si el navegador no puede recodificar, se guarda el video original.
 */

const LADO_FOTO = 1280
const LADO_MINIATURA = 360
const ANCHO_VIDEO = 540
const MAX_SEGUNDOS = 15

export interface MedioProcesado {
  tipo: 'foto' | 'video'
  archivo: Blob
  miniatura: Blob
}

function lienzo(ancho: number, alto: number, ladoMax: number) {
  const escala = Math.min(1, ladoMax / Math.max(ancho, alto))
  const c = document.createElement('canvas')
  c.width = Math.round(ancho * escala)
  c.height = Math.round(alto * escala)
  return c
}

function aJpeg(c: HTMLCanvasElement, calidad = 0.85): Promise<Blob> {
  return new Promise((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo comprimir la imagen'))), 'image/jpeg', calidad))
}

async function procesarFoto(archivo: File): Promise<MedioProcesado> {
  const img = await createImageBitmap(archivo)
  const grande = lienzo(img.width, img.height, LADO_FOTO)
  grande.getContext('2d')!.drawImage(img, 0, 0, grande.width, grande.height)
  const chica = lienzo(img.width, img.height, LADO_MINIATURA)
  chica.getContext('2d')!.drawImage(img, 0, 0, chica.width, chica.height)
  img.close()
  return { tipo: 'foto', archivo: await aJpeg(grande), miniatura: await aJpeg(chica, 0.8) }
}

function esperar(video: HTMLVideoElement, evento: string) {
  return new Promise<void>((ok, mal) => {
    video.addEventListener(evento, () => ok(), { once: true })
    video.addEventListener('error', () => mal(new Error('No se pudo leer el video')), { once: true })
  })
}

function tipoGrabacion(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t))
}

async function procesarVideo(archivo: File, alProgresar?: (p: number) => void): Promise<MedioProcesado> {
  const url = URL.createObjectURL(archivo)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = url
  try {
    await esperar(video, 'loadeddata')
    // Portada: un cuadro del comienzo.
    video.currentTime = Math.min(0.3, video.duration / 2 || 0)
    await esperar(video, 'seeked')
    const portada = lienzo(video.videoWidth, video.videoHeight, LADO_MINIATURA)
    portada.getContext('2d')!.drawImage(video, 0, 0, portada.width, portada.height)
    const miniatura = await aJpeg(portada, 0.8)

    const tipo = tipoGrabacion()
    const c = lienzo(video.videoWidth, video.videoHeight, ANCHO_VIDEO)
    if (!tipo || !('captureStream' in c)) return { tipo: 'video', archivo, miniatura }

    // Recodificar en tiempo real: se reproduce el video en un canvas chico y se graba ese canvas.
    const ctx = c.getContext('2d')!
    const grabadora = new MediaRecorder(c.captureStream(30), { mimeType: tipo, videoBitsPerSecond: 1_200_000 })
    const trozos: Blob[] = []
    grabadora.ondataavailable = (e) => e.data.size && trozos.push(e.data)
    const terminado = new Promise<void>((ok) => (grabadora.onstop = () => ok()))
    const duracion = Math.min(video.duration || MAX_SEGUNDOS, MAX_SEGUNDOS)
    video.currentTime = 0
    await esperar(video, 'seeked')
    grabadora.start(250)
    await video.play()
    await new Promise<void>((ok) => {
      const dibujar = () => {
        ctx.drawImage(video, 0, 0, c.width, c.height)
        alProgresar?.(Math.min(1, video.currentTime / duracion))
        if (video.ended || video.currentTime >= duracion) return ok()
        requestAnimationFrame(dibujar)
      }
      dibujar()
    })
    video.pause()
    grabadora.stop()
    await terminado
    const resultado = new Blob(trozos, { type: tipo.split(';')[0] })
    // Si por algún motivo salió más pesado (o vacío), se guarda el original.
    return { tipo: 'video', archivo: resultado.size > 0 && resultado.size < archivo.size ? resultado : archivo, miniatura }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function procesarMedio(archivo: File, alProgresar?: (p: number) => void): Promise<MedioProcesado> {
  if (archivo.type.startsWith('video/')) return procesarVideo(archivo, alProgresar)
  if (archivo.type.startsWith('image/')) return procesarFoto(archivo)
  return Promise.reject(new Error('El archivo no es una foto ni un video.'))
}

/** Foto de perfil: recorte cuadrado al centro, 256 px, JPEG. Devuelve un data URL (se guarda junto a los ajustes). */
export async function procesarFotoPerfil(archivo: File): Promise<string> {
  if (!archivo.type.startsWith('image/')) throw new Error('Elige una foto.')
  const img = await createImageBitmap(archivo)
  const lado = Math.min(img.width, img.height)
  const c = document.createElement('canvas')
  // 720 px: también se muestra grande, como banner (~60–90 kB en JPEG).
  const tam = Math.min(720, lado)
  c.width = c.height = tam
  c.getContext('2d')!.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, tam, tam)
  img.close()
  return c.toDataURL('image/jpeg', 0.8)
}
