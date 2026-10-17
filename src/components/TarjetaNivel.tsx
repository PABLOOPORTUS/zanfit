import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useJuego } from '../hooks/useLogros'
import { useContador } from '../hooks/useContador'

/** Nivel actual (animal animado), puntos y una barra que se llena hasta el siguiente nivel. */
export default function TarjetaNivel() {
  const juego = useJuego()
  const puntos = useContador(juego?.puntos ?? 0)
  // La barra parte vacía y se llena con una transición al montar.
  const [lleno, setLleno] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setLleno(juego?.avance ?? 0))
    return () => cancelAnimationFrame(id)
  }, [juego?.avance])
  if (!juego) return null
  const { nivel, siguiente } = juego

  return (
    <Link to="/progreso?vista=logros" className="relative block overflow-hidden rounded-2xl bg-superficie p-4 active:bg-borde">
      <div className="flex items-center gap-3">
        <img src={`/medios/animales/${nivel.archivo}.webp`} alt="" className="size-12 shrink-0 animate-flotar" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wider text-lima uppercase">Nivel {nivel.numero}</p>
          <p className="font-marca text-lg leading-tight font-semibold">{nivel.animal}</p>
          <p className="line-clamp-1 text-sm text-texto-suave">{nivel.frase}</p>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-lima tabular-nums">{puntos.toLocaleString('es-CL')} pts</span>
        {siguiente ? (
          <span className="text-texto-suave">
            Faltan {(siguiente.desde - juego.puntos).toLocaleString('es-CL')} para {siguiente.animal}
          </span>
        ) : (
          <span className="text-texto-suave">Nivel máximo</span>
        )}
      </div>
      <div
        className="relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-borde"
        role="progressbar"
        aria-valuenow={Math.round(juego.avance * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="relative h-full overflow-hidden rounded-full bg-lima transition-[width] duration-1000 ease-out"
          style={{ width: `${Math.max(lleno * 100, 3)}%` }}
        >
          <span className="absolute inset-y-0 w-1/3 animate-brillo bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
      </div>
    </Link>
  )
}
