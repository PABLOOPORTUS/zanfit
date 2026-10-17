import CuerpoMusculos from './CuerpoMusculos'
import { mediosDe } from '../db/mediosEjercicios'
import { vistaPrincipal } from '../lib/musculos'
import { useMediosPropios, useUrlBlob } from '../hooks/useMedios'
import type { Exercise } from '../types'

type Props = { ejercicio: Pick<Exercise, 'id' | 'nombre' | 'grupoMuscular' | 'propio'>; className?: string }

/**
 * Imagen chica para reconocer un ejercicio sin saberse el nombre: la foto propia, la foto del ejercicio o, en los
 * ejercicios propios sin foto, la silueta con los músculos de su grupo.
 */
export default function MiniaturaEjercicio({ ejercicio, className = 'size-16' }: Props) {
  const propios = useMediosPropios(ejercicio.id)
  const propia = useUrlBlob(propios?.[0]?.miniatura)
  const { musculos, ficha } = mediosDe(ejercicio)
  const marco = `relative block shrink-0 overflow-hidden rounded-xl bg-superficie ${className}`

  // Primero la foto o video que grabó el usuario (la máquina real de su gimnasio).
  if (propia) {
    return (
      <span className={marco} aria-hidden>
        <img src={propia} alt="" className="size-full object-cover" />
        {propios?.[0]?.tipo === 'video' && <span className="absolute right-1 bottom-0.5 text-xs font-semibold text-white drop-shadow">▶</span>}
      </span>
    )
  }

  if (ficha) {
    return (
      <span className={marco} aria-hidden>
        <img src={`/medios/fotos/${ficha.archivo}-mini.webp`} alt="" loading="lazy" className="size-full object-cover" />
      </span>
    )
  }

  const vista = vistaPrincipal(musculos)
  return (
    <span className={`${marco} p-1`} aria-hidden>
      <CuerpoMusculos musculos={musculos} vista={vista} className="mx-auto h-full w-auto [&_svg]:h-full [&_svg]:w-auto" />
    </span>
  )
}
