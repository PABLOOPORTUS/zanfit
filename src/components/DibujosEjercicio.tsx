import { Link } from 'react-router-dom'
import type { Dibujos } from '../db/mediosEjercicios'

/** Dibujos de Everkinetic (posición inicial y final), ya adaptados al modo oscuro. */
export default function DibujosEjercicio({ dibujos: { archivos: dibujos, invertir }, nombre }: { dibujos: Dibujos; nombre: string }) {
  const etiquetas = dibujos.length === 2 ? ['Inicio', 'Final'] : ['']
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-3">
      <div className={`grid gap-2 ${dibujos.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {dibujos.map((src, i) => (
          <figure key={src} className="flex flex-col items-center">
            <img
              src={src}
              alt={`${nombre}${etiquetas[i] ? `: posición de ${etiquetas[i].toLowerCase()}` : ''}`}
              className={`aspect-[285/200] w-full object-contain ${dibujos.length === 1 ? 'max-w-56' : ''} ${invertir ? 'invert' : ''}`}
              loading="lazy"
            />
            {etiquetas[i] && <figcaption className="mt-1 text-xs font-semibold text-texto-suave">{etiquetas[i]}</figcaption>}
          </figure>
        ))}
      </div>
      <Link to="/ajustes/creditos" className="inline-flex h-11 items-center text-xs text-texto-suave underline decoration-borde underline-offset-4">
        Dibujo: Everkinetic · CC BY-SA
      </Link>
    </div>
  )
}
