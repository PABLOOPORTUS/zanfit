type Props<T extends string> = {
  leyenda: string
  opciones: { valor: T; etiqueta: string }[]
  valor: T
  onChange: (valor: T) => void
  columnas?: 2 | 3
}

/** Grupo de botones grandes para elegir una opción (reemplaza a un <select>, que es difícil de usar en el gimnasio). */
export default function SelectorOpciones<T extends string>({ leyenda, opciones, valor, onChange, columnas = 3 }: Props<T>) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{leyenda}</legend>
      <div className={`grid gap-2 ${columnas === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            onClick={() => onChange(o.valor)}
            aria-pressed={valor === o.valor}
            className={`h-12 rounded-2xl border px-2 font-semibold transition-colors ${
              valor === o.valor ? 'border-lima bg-lima text-fondo' : 'border-borde bg-superficie active:bg-borde'
            }`}
          >
            {o.etiqueta}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
