import { useState } from 'react'
import MiniaturaEjercicio from '../../components/MiniaturaEjercicio'
import { useExercises } from '../../hooks/useExercises'
import type { PasoCalentamiento } from '../../types'

const clave = (workoutId: number) => `zanfit:calentado:${workoutId}`
const leer = (workoutId: number) => {
  try {
    return sessionStorage.getItem(clave(workoutId)) === '1'
  } catch {
    return false
  }
}

const duracion = (segundos: number) => (segundos >= 60 ? `${Math.round(segundos / 60)} min` : `${segundos} s`)

/** Calentamiento sugerido de la rutina del plan, arriba del entreno. Se puede marcar y cerrar ("Listo, a entrenar"). */
export default function CalentamientoEntreno({ workoutId, pasos }: { workoutId: number; pasos: PasoCalentamiento[] }) {
  const ejercicios = useExercises()
  const [listo, setListo] = useState(() => leer(workoutId))
  const [hechos, setHechos] = useState<number[]>([])
  if (!ejercicios || pasos.length === 0) return null
  const porId = new Map(ejercicios.map((e) => [e.id!, e]))

  function terminar(valor: boolean) {
    setListo(valor)
    try {
      sessionStorage.setItem(clave(workoutId), valor ? '1' : '0')
    } catch {
      // Sin sessionStorage solo se pierde el recuerdo de que ya calentó.
    }
  }

  if (listo) {
    return (
      <button
        type="button"
        onClick={() => terminar(false)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-borde bg-superficie px-4 text-sm font-semibold text-texto-suave active:bg-borde"
      >
        <span>✓ Calentamiento hecho</span>
        <span>Ver</span>
      </button>
    )
  }

  return (
    <section className="rounded-2xl border border-lima/40 bg-superficie p-4" aria-label="Calentamiento">
      <p className="font-marca text-xl font-bold">Primero, calienta</p>
      <p className="text-sm text-texto-suave">Unos minutos para preparar el cuerpo y evitar lesiones.</p>
      <ul className="mt-3 flex flex-col gap-2">
        {pasos.map((p) => {
          const ejercicio = porId.get(p.exerciseId)
          if (!ejercicio) return null
          const hecho = hechos.includes(p.exerciseId)
          return (
            <li key={p.exerciseId}>
              <button
                type="button"
                aria-pressed={hecho}
                onClick={() => setHechos((h) => (hecho ? h.filter((x) => x !== p.exerciseId) : [...h, p.exerciseId]))}
                className="flex min-h-16 w-full items-center gap-3 rounded-xl text-left active:bg-borde"
              >
                <MiniaturaEjercicio ejercicio={ejercicio} className="h-14 w-20" />
                <span className="min-w-0 flex-1">
                  <span className={`block leading-snug font-semibold ${hecho ? 'text-texto-suave line-through' : ''}`}>{ejercicio.nombre}</span>
                  <span className="text-sm text-texto-suave">{duracion(p.segundos)}</span>
                </span>
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl border-2 ${hecho ? 'border-lima bg-lima text-fondo' : 'border-borde'}`}
                  aria-hidden
                >
                  {hecho && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        onClick={() => terminar(true)}
        className="mt-4 h-14 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro"
      >
        Listo, a entrenar
      </button>
    </section>
  )
}
