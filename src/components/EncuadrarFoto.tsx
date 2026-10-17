import { useEffect, useRef, useState } from 'react'

/** Lado de la foto guardada (cuadrada; se muestra como banner y en el círculo del encabezado). */
const LADO_FINAL = 720
const ZOOM_MAX = 4

type Punto = { x: number; y: number }

/**
 * Encuadrar la foto de perfil: se arrastra con un dedo para moverla y se hace zoom con dos dedos o con la barra (para no
 * depender de gestos finos). El cuadro es lo que se guarda; la franja punteada es lo que se ve en el banner de Entrenar
 * y el círculo, lo del encabezado. Devuelve un JPEG cuadrado de 720 px como data URL.
 */
export default function EncuadrarFoto({
  fuente,
  onListo,
  onCancelar,
}: {
  fuente: Blob | string
  onListo: (url: string) => void
  onCancelar: () => void
}) {
  const marco = useRef<HTMLDivElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [lado, setLado] = useState(320)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState<Punto>({ x: 0, y: 0 })
  const punteros = useRef(new Map<number, Punto>())
  const pellizco = useRef<{ distancia: number; zoom: number } | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const url = typeof fuente === 'string' ? fuente : URL.createObjectURL(fuente)
    const imagen = new Image()
    imagen.onload = () => setImg(imagen)
    imagen.src = url
    return () => {
      if (typeof fuente !== 'string') URL.revokeObjectURL(url)
    }
  }, [fuente])

  useEffect(() => {
    const medir = () => setLado(marco.current?.clientWidth ?? 320)
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  // Escala para que la foto cubra el cuadro con zoom 1; con más zoom se agranda desde el centro.
  const base = img ? lado / Math.min(img.naturalWidth, img.naturalHeight) : 1
  const ancho = (img?.naturalWidth ?? 0) * base * zoom
  const alto = (img?.naturalHeight ?? 0) * base * zoom
  /** La foto siempre cubre el cuadro: no se puede mover más allá de sus bordes. */
  const limitar = (p: Punto, w = ancho, h = alto): Punto => ({
    x: Math.min(0, Math.max(lado - w, p.x)),
    y: Math.min(0, Math.max(lado - h, p.y)),
  })
  // Al cargar, centrada.
  useEffect(() => {
    if (img) setPos(limitar({ x: (lado - ancho) / 2, y: (lado - alto) / 2 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, lado])

  function cambiarZoom(nuevo: number) {
    const z = Math.min(ZOOM_MAX, Math.max(1, nuevo))
    // Zoom alrededor del centro del cuadro.
    const centro = { x: (lado / 2 - pos.x) / zoom, y: (lado / 2 - pos.y) / zoom }
    const w = (img?.naturalWidth ?? 0) * base * z
    const h = (img?.naturalHeight ?? 0) * base * z
    setZoom(z)
    setPos(limitar({ x: lado / 2 - centro.x * z, y: lado / 2 - centro.y * z }, w, h))
  }

  const distancia = () => {
    const [a, b] = [...punteros.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  async function usar() {
    if (!img) return
    setGuardando(true)
    const escala = base * zoom
    const c = document.createElement('canvas')
    const tam = Math.min(LADO_FINAL, Math.round(lado / escala))
    c.width = c.height = tam
    c.getContext('2d')!.drawImage(img, -pos.x / escala, -pos.y / escala, lado / escala, lado / escala, 0, 0, tam, tam)
    onListo(c.toDataURL('image/jpeg', 0.82))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-fondo" role="dialog" aria-modal="true" aria-labelledby="titulo-encuadrar">
      <div className="pt-safe mx-auto w-full max-w-lg px-4">
        <div className="flex h-14 items-center justify-between">
          <h2 id="titulo-encuadrar" className="font-marca text-xl font-semibold">
            Encuadra tu foto
          </h2>
          <button type="button" onClick={onCancelar} className="-mr-3 h-12 rounded-xl px-3 font-semibold text-texto-suave active:bg-superficie">
            Cancelar
          </button>
        </div>
        <p className="text-sm text-texto-suave">Arrastra para mover y junta o separa dos dedos para acercar.</p>
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 px-4 pt-4">
        <div
          ref={marco}
          className="relative aspect-square w-full touch-none overflow-hidden rounded-2xl bg-superficie select-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
            if (punteros.current.size === 2) pellizco.current = { distancia: distancia(), zoom }
          }}
          onPointerMove={(e) => {
            const antes = punteros.current.get(e.pointerId)
            if (!antes) return
            punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
            if (punteros.current.size === 2 && pellizco.current) {
              cambiarZoom((pellizco.current.zoom * distancia()) / pellizco.current.distancia)
            } else if (punteros.current.size === 1) {
              setPos((p) => limitar({ x: p.x + e.clientX - antes.x, y: p.y + e.clientY - antes.y }))
            }
          }}
          onPointerUp={(e) => {
            punteros.current.delete(e.pointerId)
            if (punteros.current.size < 2) pellizco.current = null
          }}
          onPointerCancel={(e) => {
            punteros.current.delete(e.pointerId)
            pellizco.current = null
          }}
        >
          {img && (
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{ width: ancho, height: alto, left: pos.x, top: pos.y }}
            />
          )}
          {/* Guías: franja del banner (Entrenar) y círculo del encabezado. */}
          <div className="pointer-events-none absolute inset-x-0 top-[19%] h-[37%] border-y border-dashed border-white/70" aria-hidden>
            <span className="absolute top-1 left-2 rounded-full bg-fondo/70 px-2 py-0.5 text-[11px] font-semibold">Banner</span>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/40" aria-hidden />
        </div>

        <label className="mt-5 flex items-center gap-3">
          <span className="text-sm text-texto-suave">Zoom</span>
          <input
            type="range"
            min={1}
            max={ZOOM_MAX}
            step={0.01}
            value={zoom}
            onChange={(e) => cambiarZoom(Number(e.target.value))}
            className="h-12 flex-1 accent-lima"
            aria-label="Zoom de la foto"
          />
        </label>
      </div>

      <div className="pb-safe mx-auto w-full max-w-lg px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={usar}
          disabled={!img || guardando}
          className="mb-4 h-13 w-full rounded-2xl bg-lima font-semibold text-fondo active:bg-lima-oscuro disabled:opacity-55"
        >
          {guardando ? 'Guardando…' : 'Usar esta foto'}
        </button>
      </div>
    </div>
  )
}
