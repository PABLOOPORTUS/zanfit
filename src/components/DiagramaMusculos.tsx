import { Link } from 'react-router-dom'
import { MUSCULOS, type Musculos } from '../db/mediosEjercicios'

/**
 * Silueta de frente y de espalda con los músculos trabajados (principales en lima, secundarios en lima tenue).
 * Debajo van los nombres, para que la información no dependa solo del color.
 */
export default function DiagramaMusculos({ musculos }: { musculos: Musculos }) {
  const nombres = (ids: number[]) => ids.map((id) => MUSCULOS[id].nombre).join(', ')
  const descripcion = `Principales: ${nombres(musculos.principales)}${musculos.secundarios.length ? `. Secundarios: ${nombres(musculos.secundarios)}` : ''}.`

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-4">
      <div className="mx-auto grid max-w-72 grid-cols-2 gap-4" role="img" aria-label={`Músculos trabajados. ${descripcion}`}>
        {(['frente', 'espalda'] as const).map((vista) => (
          <figure key={vista}>
            <div className="relative aspect-[200/369]">
              <img src={`/medios/musculos/${vista}.svg`} alt="" className="absolute inset-0 w-full opacity-35" loading="lazy" />
              {musculos.secundarios
                .filter((id) => MUSCULOS[id].vista === vista)
                .map((id) => (
                  <img key={`s${id}`} src={`/medios/musculos/secundario-${id}.svg`} alt="" className="absolute top-0 left-0 w-full" loading="lazy" />
                ))}
              {musculos.principales
                .filter((id) => MUSCULOS[id].vista === vista)
                .map((id) => (
                  <img key={`p${id}`} src={`/medios/musculos/principal-${id}.svg`} alt="" className="absolute top-0 left-0 w-full" loading="lazy" />
                ))}
            </div>
            <figcaption className="mt-1 text-center text-xs text-texto-suave capitalize">{vista}</figcaption>
          </figure>
        ))}
      </div>

      <dl className="mt-5 flex flex-col gap-1.5 text-sm">
        <div className="flex items-start gap-2">
          <dt className="flex shrink-0 items-center gap-2 text-texto-suave">
            <span className="size-3 rounded-sm bg-lima" aria-hidden /> Principales:
          </dt>
          <dd className="font-semibold">{nombres(musculos.principales)}</dd>
        </div>
        {musculos.secundarios.length > 0 && (
          <div className="flex items-start gap-2">
            <dt className="flex shrink-0 items-center gap-2 text-texto-suave">
              <span className="size-3 rounded-sm bg-lima/40" aria-hidden /> Secundarios:
            </dt>
            <dd className="font-semibold">{nombres(musculos.secundarios)}</dd>
          </div>
        )}
      </dl>
      <Link to="/ajustes/creditos" className="mt-2 inline-flex h-11 items-center text-xs text-texto-suave underline decoration-borde underline-offset-4">
        Diagrama: Termininja / wger · CC BY-SA 3.0
      </Link>
    </div>
  )
}
