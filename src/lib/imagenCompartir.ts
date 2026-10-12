/**
 * Imagen para compartir un logro en historias de Instagram, Facebook o WhatsApp (1080×1920, formato historia).
 * Se dibuja con canvas en el teléfono (sin internet ni servicios externos) y se entrega con la hoja de compartir.
 */

export interface DatosImagen {
  /** Línea chica en lima arriba del título ("ENTRENO TERMINADO"). */
  etiqueta: string
  titulo: string
  subtitulo?: string
  /** Archivo del animal en public/medios/animales (sin extensión). */
  animal: string
  /** Texto bajo el animal ("Nivel 3 · Lobo"); vacío si el título ya lo dice. */
  nivel: string
  datos: { valor: string; etiqueta: string }[]
}

const ANCHO = 1080
const ALTO = 1920
const LIMA = '#c6ff3d'
const FONDO = '#0a0a0a'
const SUPERFICIE = '#161616'
const TEXTO = '#f5f5f5'
const SUAVE = '#a3a3a3'
const MARCA = '"Space Grotesk Variable", "Space Grotesk", system-ui, sans-serif'
const CUERPO = '"Inter Variable", Inter, system-ui, sans-serif'

/** Un cuadro del emoji animado (el primero puede venir vacío, como el del dragón): se usa el de la mitad. */
async function cuadroAnimal(archivo: string): Promise<CanvasImageSource | null> {
  try {
    const datos = await (await fetch(`/medios/animales/${archivo}.webp`)).arrayBuffer()
    if ('ImageDecoder' in window) {
      const Decoder = (
        window as unknown as {
          ImageDecoder: new (o: object) => {
            tracks: { ready: Promise<void>; selectedTrack: { frameCount: number } }
            decode: (o: object) => Promise<{ image: CanvasImageSource }>
          }
        }
      ).ImageDecoder
      const dec = new Decoder({ data: datos, type: 'image/webp' })
      await dec.tracks.ready
      return (await dec.decode({ frameIndex: Math.floor(dec.tracks.selectedTrack.frameCount * 0.6) })).image
    }
  } catch {
    // Sin ImageDecoder (Safari antiguo) se usa la versión quieta.
  }
  const img = new Image()
  img.src = `/medios/animales/${archivo}-quieto.webp`
  try {
    await img.decode()
    return img
  } catch {
    return null
  }
}

function lineas(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const resultado: string[] = []
  let actual = ''
  for (const palabra of texto.split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (ctx.measureText(prueba).width > ancho && actual) {
      resultado.push(actual)
      actual = palabra
    } else actual = prueba
  }
  if (actual) resultado.push(actual)
  return resultado
}

function rectRedondeado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

export async function crearImagen(d: DatosImagen): Promise<Blob> {
  await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = ANCHO
  canvas.height = ALTO
  const ctx = canvas.getContext('2d')!

  // Fondo con un brillo lima arriba.
  ctx.fillStyle = FONDO
  ctx.fillRect(0, 0, ANCHO, ALTO)
  const brillo = ctx.createRadialGradient(ANCHO / 2, 640, 40, ANCHO / 2, 640, 700)
  brillo.addColorStop(0, 'rgba(198,255,61,0.28)')
  brillo.addColorStop(1, 'rgba(198,255,61,0)')
  ctx.fillStyle = brillo
  ctx.fillRect(0, 0, ANCHO, ALTO)

  ctx.textAlign = 'center'
  ctx.fillStyle = LIMA
  ctx.font = `700 96px ${MARCA}`
  ctx.fillText('ZANFIT', ANCHO / 2, 190)

  const animal = await cuadroAnimal(d.animal)
  if (animal) ctx.drawImage(animal, ANCHO / 2 - 230, 300, 460, 460)
  ctx.fillStyle = TEXTO
  ctx.font = `700 52px ${MARCA}`
  ctx.fillText(d.nivel, ANCHO / 2, 840)

  ctx.fillStyle = LIMA
  ctx.font = `700 40px ${CUERPO}`
  ctx.fillText(d.etiqueta.toUpperCase(), ANCHO / 2, 960)
  ctx.fillStyle = TEXTO
  ctx.font = `700 92px ${MARCA}`
  let y = 1060
  for (const l of lineas(ctx, d.titulo, ANCHO - 140).slice(0, 2)) {
    ctx.fillText(l, ANCHO / 2, y)
    y += 100
  }
  if (d.subtitulo) {
    ctx.fillStyle = SUAVE
    ctx.font = `500 42px ${CUERPO}`
    ctx.fillText(d.subtitulo, ANCHO / 2, y)
    y += 40
  }

  // Datos en tarjetas de 2 columnas.
  const cols = 2
  const margen = 70
  const gap = 30
  const w = (ANCHO - margen * 2 - gap) / cols
  const h = 190
  const top = Math.max(y + 50, 1260)
  d.datos.slice(0, 4).forEach((dato, i) => {
    const x = margen + (i % cols) * (w + gap)
    const yy = top + Math.floor(i / cols) * (h + gap)
    ctx.fillStyle = SUPERFICIE
    rectRedondeado(ctx, x, yy, w, h, 36)
    ctx.fill()
    ctx.fillStyle = LIMA
    ctx.font = `700 72px ${MARCA}`
    ctx.fillText(dato.valor, x + w / 2, yy + 100)
    ctx.fillStyle = SUAVE
    ctx.font = `500 34px ${CUERPO}`
    ctx.fillText(dato.etiqueta, x + w / 2, yy + 150)
  })

  ctx.fillStyle = SUAVE
  ctx.font = `500 34px ${CUERPO}`
  ctx.fillText('Entreno registrado con ZANFIT', ANCHO / 2, ALTO - 110)

  return new Promise((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo crear la imagen.'))), 'image/png'))
}

/**
 * Abre la hoja de compartir del teléfono con la imagen (Instagram, Facebook, WhatsApp…). Si no se pueden compartir
 * archivos (computador), la descarga. Devuelve `false` si el usuario canceló.
 * Ojo: en iPhone, `navigator.share` tiene que llamarse apenas se toca el botón; por eso la imagen se arma antes
 * (`crearImagen`) y aquí llega lista.
 */
export async function compartirImagen(blob: Blob, texto: string): Promise<boolean> {
  const archivo = new File([blob], 'zanfit-logro.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], text: texto })
      return true
    } catch (e) {
      if ((e as Error).name === 'AbortError') return false
    }
  }
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = 'zanfit-logro.png'
  enlace.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}
