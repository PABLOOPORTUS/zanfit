import { useEffect, useRef, useState } from 'react'

/**
 * Videos de Mixkit (licencia "Stock Video Free": uso comercial permitido, sin atribución obligatoria), recodificados a
 * 960×540 y ~1 Mbps. No entran en el precache: se guardan la primera vez que se ven (runtimeCaching en vite.config.ts).
 */
const CLIPS = ['pareja-sentadillas', 'mujer-pesas', 'pareja-mancuernas', 'mujer-prensa']
/** Dónde está la persona en cada clip, para que el recorte vertical del teléfono no la deje afuera. */
const ENFOQUE: Record<string, string> = { 'pareja-sentadillas': '42% 50%', 'mujer-pesas': '42% 50%', 'pareja-mancuernas': '45% 50%', 'mujer-prensa': '50% 50%' }

const reducirMovimiento = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Fondo de la pantalla de acceso: los clips en secuencia, oscurecidos. Sin conexión o con movimiento reducido, una imagen fija. */
export default function FondoAcceso() {
  const [indice, setIndice] = useState(0)
  const [sinVideo, setSinVideo] = useState(reducirMovimiento)
  const video = useRef<HTMLVideoElement>(null)
  const clip = CLIPS[indice % CLIPS.length]

  useEffect(() => {
    if (sinVideo || !video.current) return
    video.current.play().catch(() => setSinVideo(true))
  }, [indice, sinVideo])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-fondo" aria-hidden>
      {sinVideo ? (
        <img src={`/medios/fondo/${CLIPS[0]}.webp`} alt="" className="size-full object-cover" style={{ objectPosition: ENFOQUE[CLIPS[0]] }} />
      ) : (
        <video
          ref={video}
          key={clip}
          src={`/medios/fondo/${clip}.mp4`}
          poster={`/medios/fondo/${clip}.webp`}
          muted
          playsInline
          autoPlay
          preload="auto"
          onEnded={() => setIndice((i) => i + 1)}
          onError={() => setSinVideo(true)}
          className="size-full object-cover"
          style={{ objectPosition: ENFOQUE[clip] }}
        />
      )}
      <div className="absolute inset-0 bg-fondo/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-fondo/30 via-transparent to-fondo/90" />
    </div>
  )
}
