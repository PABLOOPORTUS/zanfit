import { paginaFoto, type Ficha } from '../db/fichasEjercicios'
import { useAlternar } from '../hooks/useAlternar'

/** Foto del ejercicio con su inicio y final alternando, más la fuente. */
export default function FotoMaquina({ foto, nombre }: { foto: Ficha; nombre: string }) {
  const cuadro = useAlternar(true)
  return (
    <figure className="overflow-hidden rounded-2xl border border-borde bg-superficie">
      <div className="relative aspect-[3/2] w-full bg-black">
        {[`${foto.archivo}.webp`, `${foto.archivo}-final.webp`].map((archivo, i) => (
          <img
            key={archivo}
            src={`/medios/fotos/${archivo}`}
            alt={i === 0 ? `Foto: ${nombre}` : ''}
            loading="lazy"
            className={`absolute inset-0 size-full object-contain transition-opacity duration-300 ${cuadro === i ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      {foto.nota && <p className="px-3 pt-2 text-sm text-texto">{foto.nota}</p>}
      <figcaption className="px-3 py-2 text-xs text-texto-suave">
        Foto:{' '}
        <a href={paginaFoto(foto)} target="_blank" rel="noreferrer" className="underline decoration-borde underline-offset-4">
          free-exercise-db
        </a>
      </figcaption>
    </figure>
  )
}
