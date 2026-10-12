import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectorEjercicios from '../../components/SelectorEjercicios'
import ZonaEliminar from '../../components/ZonaEliminar'
import { agregarEjercicios, eliminarEntreno, finalizarEntreno } from '../../db/workouts'
import { useAhora } from '../../hooks/useAhora'
import { useDescanso } from '../../hooks/useDescanso'
import { usePanel } from '../../hooks/usePanel'
import { useRoutine } from '../../hooks/useRoutines'
import { useBloquesEntreno } from '../../hooks/useWorkouts'
import { formatearCronometro } from '../../lib/formato'
import type { Workout } from '../../types'
import CalentamientoEntreno from './CalentamientoEntreno'
import TarjetaEjercicio from './TarjetaEjercicio'

type Modo = 'uno' | 'lista'
const CLAVE_MODO = 'zanfit:modoEntreno'
function leerModo(): Modo {
  try {
    return localStorage.getItem(CLAVE_MODO) === 'lista' ? 'lista' : 'uno'
  } catch {
    return 'uno'
  }
}

export default function EntrenoActivo({ workout }: { workout: Workout }) {
  const id = workout.id!
  const navigate = useNavigate()
  const bloques = useBloquesEntreno(id)
  const ahora = useAhora()
  const descanso = useDescanso()
  const selector = usePanel('selectorEjercicios')
  const finalizar = usePanel('finalizar')
  const rutina = useRoutine(workout.routineId ?? -1)
  // "Uno a la vez" muestra un ejercicio por pantalla; "Lista", todos. Se recuerda la preferencia.
  const [modo, setModoLocal] = useState<Modo>(leerModo)
  const [elegido, setElegido] = useState<number | null>(null)

  if (bloques === undefined) return null
  const total = bloques.reduce((n, b) => n + b.sets.length, 0)
  const completadas = bloques.reduce((n, b) => n + b.sets.filter((s) => s.completada).length, 0)
  // Al abrir (o retomar) el entreno se parte en el primer ejercicio con series pendientes; después se queda en el
  // ejercicio actual hasta que se toque "Siguiente" (no salta solo al completar la última serie).
  if (elegido === null) {
    const pendiente = bloques.findIndex((b) => b.sets.some((s) => !s.completada))
    setElegido(pendiente >= 0 ? pendiente : 0)
  }
  const indice = Math.min(elegido ?? 0, Math.max(bloques.length - 1, 0))
  const actual = bloques[indice]
  const actualCompleto = actual !== undefined && actual.sets.every((s) => s.completada)
  const visibles = modo === 'uno' && actual ? [actual] : bloques

  function setModo(m: Modo) {
    setModoLocal(m)
    try {
      localStorage.setItem(CLAVE_MODO, m)
    } catch {
      // Sin localStorage la preferencia no se recuerda.
    }
  }
  function ir(i: number) {
    setElegido(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function confirmarFinalizar() {
    descanso.saltar()
    await finalizarEntreno(id)
    navigate(`/entrenar/resumen/${id}`, { replace: true })
  }

  async function descartar() {
    descanso.saltar()
    // Cerrar la hoja antes de borrar: al borrar el entreno esta pantalla se desmonta.
    if (finalizar.abierto) finalizar.cerrar()
    await eliminarEntreno(id)
  }

  return (
    <section className="pb-28">
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 -mx-4 -mt-4 flex items-center gap-3 border-b border-borde bg-fondo/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-marca text-xl leading-tight font-bold tracking-tight">{workout.nombre}</p>
          <p className="text-sm text-texto-suave tabular-nums">
            <span className="font-semibold text-lima">{formatearCronometro(ahora - workout.fechaInicio)}</span> · {completadas}/{total} series
          </p>
        </div>
        <button type="button" onClick={finalizar.abrir} className="h-12 rounded-xl bg-lima px-5 font-bold text-fondo active:bg-lima-oscuro">
          Finalizar
        </button>
      </div>

      {rutina?.calentamiento && (
        <div className="mt-4">
          <CalentamientoEntreno workoutId={id} pasos={rutina.calentamiento} />
        </div>
      )}

      {bloques.length > 1 && (
        <div
          className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-borde bg-superficie p-1"
          role="group"
          aria-label="Cómo ver los ejercicios"
        >
          {(
            [
              ['uno', 'Uno a la vez'],
              ['lista', 'Todos'],
            ] as const
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={modo === valor}
              onClick={() => setModo(valor)}
              className={`h-11 rounded-xl text-sm font-semibold ${modo === valor ? 'bg-lima text-fondo' : 'text-texto-suave active:bg-borde'}`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      )}

      {modo === 'uno' && bloques.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <p className="font-semibold">
            Ejercicio {indice + 1} de {bloques.length}
          </p>
          <div className="flex flex-1 justify-end gap-1.5" aria-hidden>
            {bloques.map((b, i) => (
              <span
                key={b.exercise.id}
                className={`h-2 rounded-full ${i === indice ? 'w-5 bg-lima' : b.sets.every((s) => s.completada) ? 'w-2 bg-lima/50' : 'w-2 bg-borde'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {visibles.map((b) => (
          <TarjetaEjercicio
            key={b.exercise.id}
            workoutId={id}
            exercise={b.exercise}
            sets={b.sets}
            descansoSeg={b.descansoSeg}
            anteriores={b.anteriores}
            subePeso={b.subePeso}
            casiSube={b.casiSube}
            idsEnEntreno={bloques.map((x) => x.exercise.id!)}
          />
        ))}
        {bloques.length === 0 && (
          <p className="rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
            Agrega tu primer ejercicio para empezar.
          </p>
        )}
      </div>

      {modo === 'uno' && bloques.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={indice === 0}
            onClick={() => ir(indice - 1)}
            className="h-14 rounded-2xl border border-borde bg-superficie font-semibold active:bg-borde disabled:opacity-40"
          >
            ‹ Anterior
          </button>
          {indice < bloques.length - 1 ? (
            <button
              type="button"
              onClick={() => ir(indice + 1)}
              className={`h-14 rounded-2xl font-bold ${actualCompleto ? 'bg-lima text-fondo active:bg-lima-oscuro' : 'border border-borde bg-superficie active:bg-borde'}`}
            >
              Siguiente ›
            </button>
          ) : (
            <button type="button" onClick={finalizar.abrir} className="h-14 rounded-2xl bg-lima font-bold text-fondo active:bg-lima-oscuro">
              Finalizar
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={selector.abrir}
        className="mt-4 flex h-16 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-lima/60 text-lg font-semibold text-lima active:bg-lima/10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar ejercicio
      </button>

      <div className="mt-8">
        <ZonaEliminar
          boton="Descartar entreno"
          pregunta="¿Descartar este entreno?"
          detalle="Se borran todas sus series. No queda en tu historial."
          textoConfirmar="Sí, descartar"
          onEliminar={descartar}
        />
      </div>

      {selector.abierto && (
        <SelectorEjercicios
          excluir={bloques.map((b) => b.exercise.id!)}
          onCerrar={selector.cerrar}
          onAgregar={async (ids) => {
            await agregarEjercicios(id, ids)
            selector.cerrar()
          }}
        />
      )}

      {finalizar.abierto && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/70" onClick={finalizar.cerrar}>
          <div
            className="pb-safe mx-auto w-full max-w-lg rounded-t-3xl border-t border-borde bg-superficie"
            role="dialog"
            aria-modal="true"
            aria-label="Finalizar entreno"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              {completadas > 0 ? (
                <>
                  <p className="font-marca text-2xl font-bold">¿Terminaste?</p>
                  <p className="mt-1 text-texto-suave">
                    Completaste {completadas} de {total} series.
                    {completadas < total && ' Las series sin marcar no se guardan.'}
                  </p>
                  <button
                    type="button"
                    onClick={confirmarFinalizar}
                    className="mt-5 h-16 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro"
                  >
                    Finalizar entreno
                  </button>
                </>
              ) : (
                <>
                  <p className="font-marca text-2xl font-bold">No has marcado ninguna serie</p>
                  <p className="mt-1 text-texto-suave">Un entreno sin series no se guarda. ¿Quieres descartarlo?</p>
                  <button
                    type="button"
                    onClick={descartar}
                    className="mt-5 h-16 w-full rounded-2xl bg-peligro text-lg font-bold text-fondo active:opacity-80"
                  >
                    Descartar entreno
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={finalizar.cerrar}
                className="mt-3 h-14 w-full rounded-2xl border border-borde font-semibold active:bg-borde"
              >
                Seguir entrenando
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
