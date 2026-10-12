import { mediosDe, MUSCULOS } from '../db/mediosEjercicios'
import { useMediosPropios, useUrlBlob } from '../hooks/useMedios'
import type { Exercise } from '../types'

type Props = { ejercicio: Pick<Exercise, 'id' | 'nombre' | 'grupoMuscular' | 'propio'>; className?: string }

/**
 * Imagen chica para reconocer un ejercicio sin saberse el nombre: el dibujo de la posición inicial o, si no hay
 * dibujo, la silueta con el músculo principal marcado.
 */
export default function MiniaturaEjercicio({ ejercicio, className = 'size-16' }: Props) {
  const propios = useMediosPropios(ejercicio.id)
  const propia = useUrlBlob(propios?.[0]?.miniatura)
  const { dibujos, musculos, foto } = mediosDe(ejercicio)
  const marco = `relative block shrink-0 overflow-hidden rounded-xl border border-borde bg-superficie ${className}`

  // Primero la foto o video que grabó el usuario (la máquina real de su gimnasio).
  if (propia) {
    return (
      <span className={marco} aria-hidden>
        <img src={propia} alt="" className="size-full object-cover" />
        {propios?.[0]?.tipo === 'video' && <span className="absolute right-1 bottom-0.5 text-xs font-bold text-white drop-shadow">▶</span>}
      </span>
    )
  }

  if (foto) {
    return (
      <span className={marco} aria-hidden>
        <img src={`/medios/fotos/${foto.archivo}-mini.webp`} alt="" loading="lazy" className="size-full object-cover" />
      </span>
    )
  }

  if (dibujos) {
    return (
      <span className={marco} aria-hidden>
        <img src={dibujos.archivos[0]} alt="" loading="lazy" className={`size-full object-contain p-0.5 ${dibujos.invertir ? 'invert' : ''}`} />
      </span>
    )
  }

  const vista = MUSCULOS[musculos.principales[0]]?.vista ?? 'frente'
  return (
    <span className={marco} aria-hidden>
      <span className="absolute inset-x-0 top-1 mx-auto block aspect-[200/369] h-[94%]">
        <img src={`/medios/musculos/${vista}.svg`} alt="" loading="lazy" className="absolute inset-0 w-full opacity-35" />
        {musculos.principales
          .filter((id) => MUSCULOS[id].vista === vista)
          .map((id) => (
            <img key={id} src={`/medios/musculos/principal-${id}.svg`} alt="" loading="lazy" className="absolute top-0 left-0 w-full" />
          ))}
      </span>
    </span>
  )
}
