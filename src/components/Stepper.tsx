type Props = {
  etiqueta: string
  valor: number
  /** Recibe una función que calcula el valor nuevo desde el anterior: así no se pierden toques rápidos seguidos. */
  onChange: (actualizar: (anterior: number) => number) => void
  min: number
  max: number
  paso?: number
  formato?: (valor: number) => string
}

/** Número con botones grandes − / +. Más fácil que un input con las manos sudadas. */
export default function Stepper({ etiqueta, valor, onChange, min, max, paso = 1, formato = String }: Props) {
  const boton = 'flex size-12 shrink-0 items-center justify-center rounded-xl bg-borde text-2xl font-bold active:bg-texto-suave/40 disabled:opacity-30'
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-texto-suave">{etiqueta}</p>
      <div className="flex items-center justify-between gap-1">
        <button type="button" className={boton} onClick={() => onChange((v) => Math.max(min, v - paso))} disabled={valor <= min} aria-label={`Bajar ${etiqueta.toLowerCase()}`}>
          −
        </button>
        <span className="min-w-0 flex-1 text-center font-marca text-xl font-bold tabular-nums" aria-live="polite">
          {formato(valor)}
        </span>
        <button type="button" className={boton} onClick={() => onChange((v) => Math.min(max, v + paso))} disabled={valor >= max} aria-label={`Subir ${etiqueta.toLowerCase()}`}>
          +
        </button>
      </div>
    </div>
  )
}
