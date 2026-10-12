import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Dibujos } from '../db/mediosEjercicios'

const reducirMovimiento = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Dibujos de Everkinetic (posición inicial y final). Se muestran grandes y alternando, como una animación, para que
 * se entienda el movimiento. Si el sistema pide reducir el movimiento, se muestran uno al lado del otro.
 */
export default function DibujosEjercicio({ dibujos: { archivos, invertir }, nombre }: { dibujos: Dibujos; nombre: string }) {
  const [cuadro, setCuadro] = useState(0)
  const [quieto] = useState(reducirMovimiento)
  const animar = archivos.length === 2 && !quieto

  useEffect(() => {
    if (!animar) return
    const id = setInterval(() => setCuadro((c) => 1 - c), 1100)
    return () => clearInterval(id)
  }, [animar])

  const clase = `w-full object-contain ${invertir ? 'invert' : ''}`
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-3">
      {animar ? (
        <figure>
          <div className="relative mx-auto aspect-[285/200] max-w-md" role="img" aria-label={`${nombre}: animación de la posición de inicio a la final`}>
            {archivos.map((src, i) => (
              <img key={src} src={src} alt="" className={`absolute inset-0 h-full transition-opacity duration-300 ${clase} ${cuadro === i ? 'opacity-100' : 'opacity-0'}`} />
            ))}
          </div>
          <figcaption className="mt-1 flex justify-center gap-4 text-xs font-semibold">
            <span className={cuadro === 0 ? 'text-lima' : 'text-texto-suave'}>Inicio</span>
            <span className={cuadro === 1 ? 'text-lima' : 'text-texto-suave'}>Final</span>
          </figcaption>
        </figure>
      ) : (
        <div className={`grid gap-2 ${archivos.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {archivos.map((src, i) => (
            <figure key={src} className="flex flex-col items-center">
              <img
                src={src}
                alt={`${nombre}${archivos.length === 2 ? `: posición de ${i === 0 ? 'inicio' : 'final'}` : ''}`}
                className={`aspect-[285/200] ${archivos.length === 1 ? 'max-w-56' : ''} ${clase}`}
                loading="lazy"
              />
              {archivos.length === 2 && <figcaption className="mt-1 text-xs font-semibold text-texto-suave">{i === 0 ? 'Inicio' : 'Final'}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      <Link to="/ajustes/creditos" className="inline-flex h-11 items-center text-xs text-texto-suave underline decoration-borde underline-offset-4">
        Dibujo: Everkinetic · CC BY-SA
      </Link>
    </div>
  )
}
