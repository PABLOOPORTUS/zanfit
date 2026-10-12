import { useState } from 'react'
import GuiaEjercicio from '../../components/GuiaEjercicio'
import ImagenEjercicio from '../../components/ImagenEjercicio'
import SelectorEjercicios from '../../components/SelectorEjercicios'
import { mediosDe } from '../../db/mediosEjercicios'
import { nombresMusculos } from '../../lib/musculos'
import { agregarSerie, actualizarSerie, quitarEjercicio, quitarUltimaSerie, reemplazarEjercicio } from '../../db/workouts'
import { useUnidad } from '../../hooks/useAjustes'
import { useExercises } from '../../hooks/useExercises'
import { usePerfil } from '../../hooks/usePlan'
import { alternativas } from '../../lib/plan'
import { useDescanso } from '../../hooks/useDescanso'
import { usePanel } from '../../hooks/usePanel'
import { formatearDescanso, leerNumero } from '../../lib/formato'
import type { Exercise, WorkoutSet } from '../../types'

type Props = {
  workoutId: number
  exercise: Exercise
  sets: WorkoutSet[]
  descansoSeg: number
  anteriores: WorkoutSet[]
  subePeso: boolean
  casiSube?: boolean
  nota?: string
  /** Ejercicios que ya están en el entreno (no se ofrecen al reemplazar). */
  idsEnEntreno: number[]
}

/** Un ejercicio del entreno en curso: filas peso | reps | check, y botones para agregar o quitar series. */
export default function TarjetaEjercicio({ workoutId, exercise, sets, descansoSeg, anteriores, subePeso, casiSube, nota, idsEnEntreno }: Props) {
  const [confirmandoQuitar, setConfirmandoQuitar] = useState(false)
  const u = useUnidad()
  const { unidad } = u
  const selector = usePanel(`cambiar-${exercise.id}`)
  const guia = usePanel(`guia-${exercise.id}`)
  const principales = nombresMusculos(mediosDe(exercise).musculos.principales)
  const completadas = sets.filter((s) => s.completada).length

  return (
    <article className="rounded-2xl border border-borde bg-superficie">
      <header className="flex items-center gap-2 p-4 pb-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl leading-tight font-bold">{exercise.nombre}</h2>
          <p className="text-sm text-texto-suave">
            {completadas}/{sets.length} series · descanso {formatearDescanso(descansoSeg)}
          </p>
        </div>
        <button
          type="button"
          onClick={selector.abrir}
          aria-label={`Cambiar ${exercise.nombre} por otro ejercicio`}
          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-texto-suave active:bg-borde"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setConfirmandoQuitar((v) => !v)}
          aria-label={`Quitar ${exercise.nombre}`}
          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-texto-suave active:bg-borde"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </header>

      <button
        type="button"
        onClick={guia.abrir}
        aria-label={`Ver cómo se hace ${exercise.nombre}`}
        className="relative mx-4 mb-3 block w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-borde text-left active:opacity-80"
      >
        <ImagenEjercicio ejercicio={exercise} className="h-52 w-full" />
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pt-8 pb-2.5">
          <span className="min-w-0 text-sm text-white/80">Trabaja: {principales}</span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-lima px-3 py-1.5 text-sm font-bold text-fondo">
            Ver cómo se hace
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
        </span>
      </button>

      {guia.abierto && <GuiaEjercicio ejercicio={exercise} onCerrar={guia.cerrar} />}

      {nota && (
        <p className="px-4 pb-2 text-sm leading-snug">
          <span className="font-semibold text-lima">Clave: </span>
          {nota}
        </p>
      )}

      {anteriores.length > 0 && (
        <p className="px-4 pb-2 text-sm text-texto-suave">
          Última vez: {u.peso(Math.max(...anteriores.map((s) => s.peso)))} × {anteriores.map((s) => s.reps).join(' · ')}
          {subePeso && <span className="mt-1 block font-semibold text-lima">↑ Completaste todo dos veces seguidas: hoy sube el peso</span>}
          {casiSube && <span className="mt-1 block">Completaste todo la última vez. Si hoy también, la próxima sube el peso.</span>}
        </p>
      )}

      {selector.abierto && (
        <CambiarEjercicio
          exercise={exercise}
          idsEnEntreno={idsEnEntreno}
          onCerrar={selector.cerrar}
          onElegir={async (nuevo) => {
            await reemplazarEjercicio(workoutId, exercise.id!, nuevo)
            selector.cerrar()
          }}
        />
      )}

      {confirmandoQuitar && (
        <div className="mx-4 mb-2 rounded-xl border border-peligro/50 bg-peligro/10 p-3">
          <p className="font-semibold">¿Quitar este ejercicio del entreno?</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirmandoQuitar(false)}
              className="h-12 rounded-xl border border-borde bg-superficie font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => quitarEjercicio(workoutId, exercise.id!)}
              className="h-12 rounded-xl bg-peligro font-bold text-fondo"
            >
              Sí, quitar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[2rem_1fr_1fr_3.5rem] gap-2 px-4 pb-1 text-center text-xs font-semibold text-texto-suave">
        <span>Serie</span>
        <span>{unidad}</span>
        <span>Reps</span>
        <span>Listo</span>
      </div>
      <ol className="flex flex-col gap-2 px-4">
        {sets.map((s) => (
          <FilaSerie key={`${s.id}-${unidad}`} serie={s} descansoSeg={descansoSeg} />
        ))}
      </ol>

      <div className="grid grid-cols-2 gap-2 p-4">
        <button
          type="button"
          onClick={() => quitarUltimaSerie(workoutId, exercise.id!)}
          disabled={sets.length <= 1}
          className="h-12 rounded-xl border border-borde font-semibold active:bg-borde disabled:opacity-30"
        >
          − Quitar serie
        </button>
        <button
          type="button"
          onClick={() => agregarSerie(workoutId, exercise.id!)}
          className="h-12 rounded-xl border border-borde font-semibold active:bg-borde"
        >
          + Agregar serie
        </button>
      </div>
    </article>
  )
}

/** Los inputs usan estado local (la base se actualiza en cada cambio) para no perder teclas mientras escribes. */
function FilaSerie({ serie, descansoSeg }: { serie: WorkoutSet; descansoSeg: number }) {
  const descanso = useDescanso()
  const u = useUnidad()
  // Se muestra en la unidad elegida, redondeado a 2 decimales (lb → kg → lb no siempre es exacto).
  const [peso, setPeso] = useState(serie.peso ? String(Math.round(u.aUnidad(serie.peso) * 100) / 100).replace('.', ',') : '')
  const [reps, setReps] = useState(serie.reps ? String(serie.reps) : '')

  function alternarCompletada() {
    const completada = !serie.completada
    void actualizarSerie(serie.id!, { completada })
    if (completada) {
      ;(document.activeElement as HTMLElement | null)?.blur()
      descanso.iniciar(descansoSeg)
    }
  }

  const input = `h-14 w-full min-w-0 rounded-xl border text-center font-marca text-xl font-bold tabular-nums placeholder:text-texto-suave/50 focus:border-lima focus:outline-none ${
    serie.completada ? 'border-lima/30 bg-lima/10' : 'border-borde bg-fondo'
  }`

  return (
    <li className="grid grid-cols-[2rem_1fr_1fr_3.5rem] items-center gap-2">
      <span className="text-center font-marca text-lg font-bold text-texto-suave">{serie.numeroSerie}</span>
      <input
        type="text"
        inputMode="decimal"
        value={peso}
        placeholder="0"
        aria-label={`Peso serie ${serie.numeroSerie}`}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const texto = e.target.value.replace(/[^\d.,]/g, '')
          setPeso(texto)
          void actualizarSerie(serie.id!, { peso: u.aKg(leerNumero(texto)) })
        }}
        className={input}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={reps}
        placeholder="0"
        aria-label={`Reps serie ${serie.numeroSerie}`}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const texto = e.target.value.replace(/\D/g, '')
          setReps(texto)
          void actualizarSerie(serie.id!, { reps: Number(texto) || 0 })
        }}
        className={input}
      />
      <button
        type="button"
        onClick={alternarCompletada}
        aria-pressed={serie.completada}
        aria-label={`${serie.completada ? 'Desmarcar' : 'Marcar'} serie ${serie.numeroSerie}`}
        className={`flex size-14 items-center justify-center rounded-xl border-2 transition-colors ${
          serie.completada ? 'border-lima bg-lima text-fondo' : 'border-borde text-texto-suave active:bg-borde'
        }`}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m5 12 5 5 9-10" />
        </svg>
      </button>
    </li>
  )
}

type PropsCambiar = { exercise: Exercise; idsEnEntreno: number[]; onCerrar: () => void; onElegir: (id: number) => void }

/** Selector para reemplazar un ejercicio, con alternativas parecidas arriba (mismo movimiento, su equipo, sin sus lesiones). */
function CambiarEjercicio({ exercise, idsEnEntreno, onCerrar, onElegir }: PropsCambiar) {
  const ejercicios = useExercises()
  const perfil = usePerfil()
  const sugeridos = ejercicios && perfil !== undefined ? alternativas(exercise, ejercicios, perfil).filter((e) => !idsEnEntreno.includes(e.id!)) : []
  return (
    <SelectorEjercicios
      titulo="Cambiar ejercicio"
      unico
      grupoInicial={exercise.grupoMuscular}
      sugeridos={sugeridos}
      excluir={idsEnEntreno}
      onCerrar={onCerrar}
      onAgregar={([nuevo]) => onElegir(nuevo)}
    />
  )
}
