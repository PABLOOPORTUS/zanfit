import CuerpoMusculos from './CuerpoMusculos'
import { nombresMusculos, type Musculos } from '../lib/musculos'

/**
 * Silueta de frente y de espalda con los músculos trabajados (principales en lima, secundarios en lima tenue).
 * Debajo van los nombres, para que la información no dependa solo del color.
 */
export default function DiagramaMusculos({ musculos }: { musculos: Musculos }) {
  const descripcion = `Principales: ${nombresMusculos(musculos.principales)}${musculos.secundarios.length ? `. Secundarios: ${nombresMusculos(musculos.secundarios)}` : ''}.`

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-4">
      <div className="mx-auto grid max-w-72 grid-cols-2 gap-4" role="img" aria-label={`Músculos trabajados. ${descripcion}`}>
        {(['frente', 'espalda'] as const).map((vista) => (
          <figure key={vista}>
            <CuerpoMusculos musculos={musculos} vista={vista} />
            <figcaption className="mt-1 text-center text-xs text-texto-suave capitalize">{vista}</figcaption>
          </figure>
        ))}
      </div>

      <dl className="mt-5 flex flex-col gap-1.5 text-sm">
        <div className="flex items-start gap-2">
          <dt className="flex shrink-0 items-center gap-2 text-texto-suave">
            <span className="size-3 rounded-sm bg-lima" aria-hidden /> Principales:
          </dt>
          <dd className="font-semibold">{nombresMusculos(musculos.principales)}</dd>
        </div>
        {musculos.secundarios.length > 0 && (
          <div className="flex items-start gap-2">
            <dt className="flex shrink-0 items-center gap-2 text-texto-suave">
              <span className="size-3 rounded-sm bg-lima/45" aria-hidden /> Secundarios:
            </dt>
            <dd className="font-semibold">{nombresMusculos(musculos.secundarios)}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
