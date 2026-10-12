import { useNavigate } from 'react-router-dom'
import SelectorEjercicios from '../../components/SelectorEjercicios'
import ZonaEliminar from '../../components/ZonaEliminar'
import { agregarEjercicios, eliminarEntreno, finalizarEntreno } from '../../db/workouts'
import { useAhora } from '../../hooks/useAhora'
import { useDescanso } from '../../hooks/useDescanso'
import { usePanel } from '../../hooks/usePanel'
import { useBloquesEntreno } from '../../hooks/useWorkouts'
import { formatearCronometro } from '../../lib/formato'
import type { Workout } from '../../types'
import TarjetaEjercicio from './TarjetaEjercicio'

export default function EntrenoActivo({ workout }: { workout: Workout }) {
  const id = workout.id!
  const navigate = useNavigate()
  const bloques = useBloquesEntreno(id)
  const ahora = useAhora()
  const descanso = useDescanso()
  const selector = usePanel('selectorEjercicios')
  const finalizar = usePanel('finalizar')

  if (bloques === undefined) return null
  const total = bloques.reduce((n, b) => n + b.sets.length, 0)
  const completadas = bloques.reduce((n, b) => n + b.sets.filter((s) => s.completada).length, 0)

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

      <div className="mt-4 flex flex-col gap-4">
        {bloques.map((b) => (
          <TarjetaEjercicio
            key={b.exercise.id}
            workoutId={id}
            exercise={b.exercise}
            sets={b.sets}
            descansoSeg={b.descansoSeg}
            anteriores={b.anteriores}
            subePeso={b.subePeso}
            idsEnEntreno={bloques.map((x) => x.exercise.id!)}
          />
        ))}
        {bloques.length === 0 && (
          <p className="rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
            Agrega tu primer ejercicio para empezar.
          </p>
        )}
      </div>

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
                  <button type="button" onClick={confirmarFinalizar} className="mt-5 h-16 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro">
                    Finalizar entreno
                  </button>
                </>
              ) : (
                <>
                  <p className="font-marca text-2xl font-bold">No has marcado ninguna serie</p>
                  <p className="mt-1 text-texto-suave">Un entreno sin series no se guarda. ¿Quieres descartarlo?</p>
                  <button type="button" onClick={descartar} className="mt-5 h-16 w-full rounded-2xl bg-peligro text-lg font-bold text-fondo active:opacity-80">
                    Descartar entreno
                  </button>
                </>
              )}
              <button type="button" onClick={finalizar.cerrar} className="mt-3 h-14 w-full rounded-2xl border border-borde font-semibold active:bg-borde">
                Seguir entrenando
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
