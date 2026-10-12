import CuerpoMusculos from './CuerpoMusculos'
import { mediosDe } from '../db/mediosEjercicios'
import { useAlternar } from '../hooks/useAlternar'
import { useMediosPropios, useUrlBlob } from '../hooks/useMedios'
import type { Exercise } from '../types'

type Props = { ejercicio: Pick<Exercise, 'id' | 'nombre' | 'grupoMuscular' | 'propio'>; className?: string }

/**
 * Imagen grande para reconocer el ejercicio de un vistazo (por ejemplo, en el entreno).
 * Prioridad: foto o video propio (su portada) > foto del ejercicio (inicio y final alternando) > silueta con los músculos.
 */
export default function ImagenEjercicio({ ejercicio, className = 'h-48 w-full' }: Props) {
  const propios = useMediosPropios(ejercicio.id)
  const propia = useUrlBlob(propios?.[0]?.miniatura)
  const { musculos, ficha } = mediosDe(ejercicio)
  const cuadro = useAlternar(!propia && !!ficha)

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

  if (ficha) {
    return (
      <span className={`${marco} bg-fondo`}>
        {[`${ficha.archivo}.webp`, `${ficha.archivo}-final.webp`].map((archivo, i) => (
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

  return (
    <span className={`${marco} bg-superficie py-2`}>
      <span className="mx-auto grid h-full max-w-56 grid-cols-2 gap-2">
        <CuerpoMusculos musculos={musculos} vista="frente" className="h-full [&_svg]:h-full" />
        <CuerpoMusculos musculos={musculos} vista="espalda" className="h-full [&_svg]:h-full" />
      </span>
    </span>
  )
}
