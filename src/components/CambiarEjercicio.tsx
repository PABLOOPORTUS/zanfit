import { useState } from 'react'
import MiniaturaEjercicio from './MiniaturaEjercicio'
import SelectorEjercicios from './SelectorEjercicios'
import { mediosDe } from '../db/mediosEjercicios'
import { useExercises } from '../hooks/useExercises'
import { usePerfil } from '../hooks/usePlan'
import { etiquetaEquipo } from '../lib/catalogos'
import { nombresMusculos } from '../lib/musculos'
import { alternativas } from '../lib/plan'
import type { Equipo, Exercise } from '../types'

/** Cuántos se muestran por equipo (el resto se encuentra en "Buscar en todos"). */
const POR_EQUIPO = 5

type Props = {
  exercise: Exercise
  excluir: number[]
  onCerrar: () => void
  onElegir: (id: number) => void
}

/**
 * Reemplazar un ejercicio en el entreno o en una rutina (máquina ocupada, no le acomoda…): solo los que de verdad lo
 * reemplazan (`alternativas`), agrupados por equipo para elegir rápido otra cosa cuando el aparato está ocupado. Abajo
 * se puede buscar en toda la biblioteca.
 */
export default function CambiarEjercicio({ exercise, excluir, onCerrar, onElegir }: Props) {
  const ejercicios = useExercises()
  const perfil = usePerfil()
  const [buscarTodo, setBuscarTodo] = useState(false)

  if (buscarTodo)
    return (
      <SelectorEjercicios
        titulo="Cambiar ejercicio"
        unico
        grupoInicial={exercise.grupoMuscular}
        excluir={excluir}
        onCerrar={() => setBuscarTodo(false)}
        onAgregar={([nuevo]) => onElegir(nuevo)}
      />
    )

  const cargando = !ejercicios || perfil === undefined
  const opciones = cargando ? [] : alternativas(exercise, ejercicios, perfil).filter((e) => !excluir.includes(e.id!))
  // Agrupados por equipo: primero el mismo equipo y después en el orden de las mejores opciones.
  const grupos = new Map<Equipo, Exercise[]>()
  for (const e of opciones) grupos.set(e.equipo, [...(grupos.get(e.equipo) ?? []), e])
  const orden = [...grupos.keys()].sort((a, b) => Number(b === exercise.equipo) - Number(a === exercise.equipo))
  const musculos = nombresMusculos(mediosDe(exercise).musculos.principales)

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-fondo" role="dialog" aria-modal="true" aria-label="Cambiar ejercicio">
      <div className="pt-safe mx-auto w-full max-w-lg border-b border-borde px-4 pb-3">
        <div className="flex h-12 items-center justify-between">
          <h2 className="font-marca text-xl font-semibold">Cambiar ejercicio</h2>
          <button type="button" onClick={onCerrar} className="-mr-3 h-12 rounded-xl px-3 font-semibold text-texto-suave active:bg-superficie">
            Cancelar
          </button>
        </div>
        <p className="text-texto-suave">
          En vez de <span className="font-semibold text-texto">{exercise.nombre}</span>
          {musculos && <>, estos trabajan lo mismo ({musculos})</>}. Se mantienen tus series y repeticiones.
        </p>
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 pb-4">
        {!cargando && opciones.length === 0 && (
          <p className="py-8 text-center text-texto-suave">No encontramos reemplazos parecidos con tu equipo. Busca otro en la biblioteca.</p>
        )}
        {orden.map((equipo) => (
          <section key={equipo}>
            <h3 className="pt-5 pb-1 text-sm font-semibold tracking-wide text-lima uppercase">
              {etiquetaEquipo(equipo)}
              {equipo === exercise.equipo && <span className="text-texto-suave"> · mismo equipo</span>}
            </h3>
            <ul className="divide-y divide-borde">
              {grupos
                .get(equipo)!
                .slice(0, POR_EQUIPO)
                .map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => onElegir(e.id!)}
                      className="flex min-h-13 w-full items-center gap-3 py-3 text-left active:bg-superficie"
                    >
                      <MiniaturaEjercicio ejercicio={e} className="h-14 w-20" />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-lg leading-snug font-semibold">{e.nombre}</span>
                        <span className="text-sm text-texto-suave">{nombresMusculos(mediosDe(e).musculos.principales)}</span>
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="pb-safe border-t border-borde bg-superficie">
        <div className="mx-auto max-w-lg p-4">
          <button
            type="button"
            onClick={() => setBuscarTodo(true)}
            className="h-12 w-full rounded-2xl border border-borde bg-fondo font-semibold active:bg-borde"
          >
            Buscar en todos los ejercicios
          </button>
        </div>
      </div>
    </div>
  )
}
