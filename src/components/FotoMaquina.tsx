import type { FotoEjercicio } from '../db/fotosEjercicios'

/** Foto real (Wikimedia Commons, licencia libre) con su crédito: autor, licencia y enlace a la fuente, como exige CC BY. */
export default function FotoMaquina({ foto, nombre }: { foto: FotoEjercicio; nombre: string }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-borde bg-superficie">
      <img src={`/medios/fotos/${foto.archivo}.webp`} alt={`Foto: ${nombre}`} loading="lazy" className="max-h-[50vh] w-full bg-black object-contain" />
      <figcaption className="px-3 py-2 text-xs text-texto-suave">
        Foto: {foto.autor || 'autor desconocido'} ·{' '}
        <a href={foto.pagina} target="_blank" rel="noreferrer" className="underline decoration-borde underline-offset-4">
          {foto.licencia}
        </a>{' '}
        · Wikimedia Commons
      </figcaption>
    </figure>
  )
}
