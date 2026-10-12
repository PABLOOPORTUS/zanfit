import Model from 'react-body-highlighter'
import { MUSCULOS, type Musculos } from '../lib/musculos'

type Props = { musculos: Musculos; vista: 'frente' | 'espalda'; className?: string }

/** Silueta (react-body-highlighter) con los músculos principales en lima y los secundarios en lima tenue. */
export default function CuerpoMusculos({ musculos, vista, className }: Props) {
  const zonas = (lista: Musculos['principales']) => [...new Set(lista.flatMap((m) => MUSCULOS[m].zonas))]
  const principales = zonas(musculos.principales)
  const secundarios = zonas(musculos.secundarios).filter((z) => !principales.includes(z))
  // La intensidad es la cantidad de veces que aparece una zona: 1 = secundario, 2 = principal.
  const data = [
    { name: 'secundarios', muscles: secundarios },
    { name: 'principales', muscles: principales, frequency: 2 },
  ]
  return (
    <span className={`block ${className ?? ''}`} aria-hidden>
      <Model
        type={vista === 'frente' ? 'anterior' : 'posterior'}
        data={data}
        bodyColor="var(--color-borde)"
        highlightedColors={['color-mix(in srgb, var(--color-lima) 45%, transparent)', 'var(--color-lima)']}
        style={{ width: '100%' }}
        svgStyle={{ width: '100%', height: 'auto' }}
      />
    </span>
  )
}
