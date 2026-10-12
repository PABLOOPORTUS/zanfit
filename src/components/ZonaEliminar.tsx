import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Texto del botón, p. ej. "Eliminar rutina". */
  boton: string
  /** Pregunta de confirmación, p. ej. "¿Eliminar «Push»?". */
  pregunta: string
  detalle?: string
  textoConfirmar?: string
  /** Si viene, no se puede eliminar y se muestra este motivo en vez del botón. */
  bloqueo?: string
  onEliminar: () => void | Promise<void>
}

/** Botón de eliminar con confirmación dentro de la pantalla (sin window.confirm). */
export default function ZonaEliminar({
  boton,
  pregunta,
  detalle = 'Esta acción no se puede deshacer.',
  textoConfirmar = 'Sí, eliminar',
  bloqueo,
  onEliminar,
}: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (confirmando) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [confirmando])

  if (bloqueo) return <p className="text-sm text-texto-suave">{bloqueo}</p>

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="h-14 w-full rounded-2xl border border-peligro/60 font-semibold text-peligro active:bg-peligro/10"
      >
        {boton}
      </button>
    )
  }

  return (
    <div ref={ref} className="rounded-2xl border border-peligro/50 bg-peligro/10 p-4">
      <p className="font-semibold">{pregunta}</p>
      <p className="mt-1 text-texto-suave">{detalle}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="h-14 rounded-2xl border border-borde bg-superficie font-semibold active:bg-borde"
        >
          Cancelar
        </button>
        <button type="button" onClick={onEliminar} className="h-14 rounded-2xl bg-peligro font-bold text-fondo active:opacity-80">
          {textoConfirmar}
        </button>
      </div>
    </div>
  )
}
