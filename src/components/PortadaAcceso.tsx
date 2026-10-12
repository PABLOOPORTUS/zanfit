import { useEffect, useState } from 'react'
import { FOTOS } from '../db/fotosEjercicios'
import Marca from './Marca'

/** Fotos reales de gimnasio que ya vienen en la app (no pesan nada extra y funcionan sin internet). */
const ESCENAS = ['Sentadilla', 'Press de banca', 'Dominadas', 'Peso muerto', 'Remo con barra', 'Prensa de piernas'].flatMap((n) => (FOTOS[n] ? [FOTOS[n]] : []))

const FRASES = ['Un día más fuerte.', 'La constancia gana.', 'Tu mejor marca te espera.', 'Hoy entrenas por ti.', 'Cada serie cuenta.', 'Más fuerte que ayer.']

const DURACION_MS = 6000
const reducirMovimiento = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Portada de la pantalla de acceso: fotos de gimnasio que se van cambiando con un zoom lento y una frase motivadora.
 * Si el sistema pide reducir el movimiento, queda fija en la primera foto y frase.
 */
export default function PortadaAcceso() {
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    if (reducirMovimiento() || ESCENAS.length < 2) return
    const id = setInterval(() => setIndice((i) => i + 1), DURACION_MS)
    return () => clearInterval(id)
  }, [])

  const actual = ESCENAS[indice % ESCENAS.length]
  return (
    <div className="relative -mx-4 h-[46dvh] min-h-72 overflow-hidden">
      {ESCENAS.map((foto, i) => {
        const visible = i === indice % ESCENAS.length
        return (
          <img
            // Cambiar la key reinicia la animación de zoom cada vez que la foto vuelve a aparecer.
            key={visible ? `${foto.archivo}-${indice}` : foto.archivo}
            src={`/medios/fotos/${foto.archivo}.webp`}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${visible ? 'animate-acercar opacity-100' : 'opacity-0'}`}
          />
        )
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-fondo/40 via-fondo/30 to-fondo" />
      <div className="pt-safe absolute inset-x-0 bottom-0 px-6 pb-6 text-center">
        <Marca className="text-6xl drop-shadow-lg" />
        <p key={indice} className="mt-2 animate-subir-frase font-marca text-2xl font-bold text-white drop-shadow-lg">
          {FRASES[indice % FRASES.length]}
        </p>
      </div>
      {actual && (
        <a
          href={actual.pagina}
          target="_blank"
          rel="noreferrer"
          className="pt-safe absolute top-0 right-0 m-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/70"
        >
          Foto: {actual.autor || 'autor sin identificar'} · {actual.licencia}
        </a>
      )}
    </div>
  )
}
