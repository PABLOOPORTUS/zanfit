import { mediosDe, MUSCULOS } from '../db/mediosEjercicios'
import { useAlternar } from '../hooks/useAlternar'
import { useMediosPropios, useUrlBlob } from '../hooks/useMedios'
import type { Exercise } from '../types'

type Props = { ejercicio: Pick<Exercise, 'id' | 'nombre' | 'grupoMuscular' | 'propio'>; className?: string }

/**
 * Imagen grande para reconocer el ejercicio de un vistazo (por ejemplo, en el entreno).
 * Prioridad: foto o video propio (su portada) > foto del ejercicio (inicio y final alternando) > dibujo animado > silueta con el músculo.
 */
export default function ImagenEjercicio({ ejercicio, className = 'h-48 w-full' }: Props) {
  const propios = useMediosPropios(ejercicio.id)
  const propia = useUrlBlob(propios?.[0]?.miniatura)
  const { dibujos, musculos, foto } = mediosDe(ejercicio)
  const cuadro = useAlternar(!propia && (!!foto || dibujos?.archivos.length === 2))

  const marco = `relative block overflow-hidden ${className}`

  if (propia) {
    return (
      <span className={`${marco} bg-fondo`}>
        <img src={propia} alt="" className="size-full object-cover" />
        {propios?.[0]?.tipo === 'video' && (
          <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-white">▶ Tu video</span>
        )}
      </span>
    )
  }

  if (foto) {
    return (
      <span className={`${marco} bg-fondo`}>
        {[`${foto.archivo}.webp`, `${foto.archivo}-final.webp`].map((archivo, i) => (
          <img
            key={archivo}
            src={`/medios/fotos/${archivo}`}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${cuadro === i ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </span>
    )
  }

  if (dibujos) {
    // Los SVG traen relleno #161616 (bg-superficie): el fondo tiene que ser el mismo para que no se note el recuadro.
    return (
      <span className={`${marco} bg-superficie`}>
        {dibujos.archivos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 size-full object-contain p-2 transition-opacity duration-300 ${dibujos.invertir ? 'invert' : ''} ${
              dibujos.archivos.length === 1 || cuadro === i ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </span>
    )
  }

  const vista = MUSCULOS[musculos.principales[0]]?.vista ?? 'frente'
  return (
    <span className={`${marco} bg-superficie`}>
      <span className="absolute inset-y-2 left-1/2 block aspect-[200/369] -translate-x-1/2">
        <img src={`/medios/musculos/${vista}.svg`} alt="" className="absolute inset-0 w-full opacity-35" />
        {musculos.principales
          .filter((id) => MUSCULOS[id].vista === vista)
          .map((id) => (
            <img key={id} src={`/medios/musculos/principal-${id}.svg`} alt="" className="absolute top-0 left-0 w-full" />
          ))}
      </span>
    </span>
  )
}
