type Props = { titulo: string; detalle?: string; activo: boolean; onClick: () => void; multiple?: boolean }

/** Opción grande para cuestionarios: título, detalle y una marca (círculo si es única, cuadrado si es múltiple). */
export default function OpcionGrande({ titulo, detalle, activo, onClick, multiple = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
        activo ? 'border-lima bg-lima/10' : 'border-borde bg-superficie active:bg-borde'
      }`}
    >
      <span
        aria-hidden
        className={`flex size-7 shrink-0 items-center justify-center border-2 ${multiple ? 'rounded-lg' : 'rounded-full'} ${
          activo ? 'border-lima bg-lima text-fondo' : 'border-borde'
        }`}
      >
        {activo && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5 9-10" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg leading-snug font-semibold">{titulo}</span>
        {detalle && <span className="mt-0.5 block text-sm text-texto-suave">{detalle}</span>}
      </span>
    </button>
  )
}
