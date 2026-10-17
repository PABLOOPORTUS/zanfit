import { useState } from 'react'
import DiagramaMusculos from './DiagramaMusculos'
import { mediosDe } from '../db/mediosEjercicios'
import { etiquetaEquipo } from '../lib/catalogos'
import { CATEGORIAS, EQUIPAMIENTOS, MECANICAS, NIVELES } from '../lib/musculos'
import type { Exercise } from '../types'

export type Pestana = 'instrucciones' | 'musculos' | 'equipo'

const PESTANAS: { valor: Pestana; etiqueta: string }[] = [
  { valor: 'instrucciones', etiqueta: 'Instrucciones' },
  { valor: 'musculos', etiqueta: 'Músculos' },
  { valor: 'equipo', etiqueta: 'Equipamiento' },
]

type Props = {
  ejercicio: Exercise
  /** Controlada desde afuera (por ejemplo, desde la URL); si no, guarda su propio estado. */
  pestana?: Pestana
  onCambiar?: (p: Pestana) => void
}

/** Ficha de un ejercicio en pestañas: cómo se hace, músculos trabajados y equipamiento (con nivel y tipo). */
export default function PestanasEjercicio({ ejercicio, pestana, onCambiar }: Props) {
  const [local, setLocal] = useState<Pestana>('instrucciones')
  const actual = pestana ?? local
  const cambiar = onCambiar ?? setLocal
  const { ficha, musculos } = mediosDe(ejercicio)

  return (
    <div>
      <div role="tablist" aria-label="Información del ejercicio" className="grid grid-cols-3 gap-1 rounded-2xl bg-superficie p-1">
        {PESTANAS.map((p) => (
          <button
            key={p.valor}
            type="button"
            role="tab"
            aria-selected={actual === p.valor}
            onClick={() => cambiar(p.valor)}
            className={`h-12 rounded-xl text-sm font-semibold ${actual === p.valor ? 'bg-lima text-fondo' : 'text-texto-suave active:bg-borde'}`}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-3">
        {actual === 'instrucciones' && (
          <div className="rounded-2xl bg-superficie p-4 text-lg leading-relaxed">
            {ejercicio.instrucciones ?? (
              <span className="text-texto-suave">Sin instrucciones. {ejercicio.propio && 'Puedes agregarlas editando el ejercicio.'}</span>
            )}
          </div>
        )}
        {actual === 'musculos' && <DiagramaMusculos musculos={musculos} />}
        {actual === 'equipo' && (
          <dl className="divide-y divide-borde overflow-hidden rounded-2xl bg-superficie">
            <Dato titulo="Equipamiento" valor={ficha ? EQUIPAMIENTOS[ficha.equipamiento] : etiquetaEquipo(ejercicio.equipo)} />
            {ficha && <Dato titulo="Nivel" valor={NIVELES[ficha.nivel]} />}
            {ficha && <Dato titulo="Tipo" valor={CATEGORIAS[ficha.categoria]} />}
            {ficha?.mecanica && <Dato titulo="Movimiento" valor={MECANICAS[ficha.mecanica]} />}
          </dl>
        )}
      </div>
    </div>
  )
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-texto-suave">{titulo}</dt>
      <dd className="text-right font-semibold">{valor}</dd>
    </div>
  )
}
