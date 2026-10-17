import CambiarEjercicio from './CambiarEjercicio'
import { usePanel } from '../hooks/usePanel'
import type { Exercise } from '../types'

/** "Cambiar" en cada ejercicio de una rutina (detalle y /plan): abre las alternativas y guarda el cambio al tiro. */
export default function BotonCambiarEjercicio({
  ejercicio,
  excluir,
  onElegir,
  rutinaId,
  className = 'h-16 w-16 self-stretch border-l border-borde',
}: {
  ejercicio: Exercise
  excluir: number[]
  onElegir: (id: number) => Promise<void>
  /** Para distinguir el panel si el mismo ejercicio está en varias rutinas de la pantalla (/plan). */
  rutinaId?: number
  className?: string
}) {
  const panel = usePanel(`cambiar-${rutinaId ?? ''}-${ejercicio.id}`)
  return (
    <>
      <button
        type="button"
        onClick={panel.abrir}
        aria-label={`Cambiar ${ejercicio.nombre} por otro ejercicio`}
        className={`flex shrink-0 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-texto-suave active:bg-borde ${className}`}
      >
        <svg
          width="20"
          height="20"
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
        Cambiar
      </button>
      {panel.abierto && (
        <CambiarEjercicio
          exercise={ejercicio}
          excluir={excluir}
          onCerrar={panel.cerrar}
          onElegir={async (nuevo) => {
            await onElegir(nuevo)
            panel.cerrar()
          }}
        />
      )}
    </>
  )
}
