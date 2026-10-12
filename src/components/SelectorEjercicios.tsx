import { useMemo, useState } from 'react'
import { useExercises } from '../hooks/useExercises'
import MiniaturaEjercicio from './MiniaturaEjercicio'
import { EQUIPOS, etiquetaEquipo, etiquetaGrupo, GRUPOS_MUSCULARES } from '../lib/catalogos'
import { filtrarEjercicios, POR_PAGINA } from '../lib/filtroEjercicios'
import type { Equipo, Exercise, GrupoMuscular } from '../types'

type Props = {
  titulo?: string
  /** Ejercicios que ya están (se muestran marcados como "Ya está" y no se pueden elegir). */
  excluir: number[]
  onAgregar: (ids: number[]) => void
  onCerrar: () => void
  /** Elegir uno solo (para reemplazar): al tocarlo se confirma de inmediato. */
  unico?: boolean
  grupoInicial?: GrupoMuscular
  /** Se muestran arriba (sin búsqueda ni filtros) como "Alternativas parecidas". */
  sugeridos?: Exercise[]
}

/** Panel a pantalla completa para elegir uno o varios ejercicios de la biblioteca. Ábrelo con `usePanel`. */
export default function SelectorEjercicios({
  titulo = 'Agregar ejercicios',
  excluir,
  onAgregar,
  onCerrar,
  unico = false,
  grupoInicial,
  sugeridos,
}: Props) {
  const ejercicios = useExercises()
  const [busqueda, setBusqueda] = useState('')
  const [grupo, setGrupoLocal] = useState<GrupoMuscular | null>(grupoInicial ?? null)
  const [equipo, setEquipoLocal] = useState<Equipo | null>(null)
  const [limite, setLimite] = useState(POR_PAGINA)
  const [elegidos, setElegidos] = useState<number[]>([])
  // Al cambiar un filtro se vuelve a la primera página.
  function setGrupo(g: GrupoMuscular | null) {
    setGrupoLocal(g)
    setLimite(POR_PAGINA)
  }
  function setEquipo(e: Equipo | null) {
    setEquipoLocal(e)
    setLimite(POR_PAGINA)
  }
  function buscar(texto: string) {
    setBusqueda(texto)
    setLimite(POR_PAGINA)
  }

  const filtrados = useMemo(() => filtrarEjercicios(ejercicios ?? [], { busqueda, grupo, equipo, tipo: null }), [ejercicios, busqueda, grupo, equipo])

  const alternar = (id: number) => {
    if (unico) return onAgregar([id])
    setElegidos((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]))
  }

  const fila = (e: Exercise, clave = String(e.id)) => {
    const yaEsta = excluir.includes(e.id!)
    const elegido = elegidos.includes(e.id!)
    return (
      <li key={clave}>
        <button
          type="button"
          disabled={yaEsta}
          onClick={() => alternar(e.id!)}
          aria-pressed={elegido}
          className="flex min-h-16 w-full items-center gap-3 py-3 text-left active:bg-superficie disabled:opacity-40"
        >
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg border-2 ${
              elegido ? 'border-lima bg-lima text-fondo' : 'border-borde'
            } ${unico ? 'hidden' : ''}`}
            aria-hidden
          >
            {elegido && (
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
          <MiniaturaEjercicio ejercicio={e} className="h-14 w-20" />
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 text-lg leading-snug font-semibold">{e.nombre}</span>
            <span className="text-sm text-texto-suave">
              {yaEsta ? 'Ya está agregado' : `${etiquetaGrupo(e.grupoMuscular)} · ${etiquetaEquipo(e.equipo)}`}
            </span>
          </span>
        </button>
      </li>
    )
  }

  const mostrarSugeridos = !!sugeridos?.length && !busqueda.trim() && equipo === null && grupo === (grupoInicial ?? null)

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-fondo" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="pt-safe mx-auto w-full max-w-lg border-b border-borde px-4 pb-3">
        <div className="flex h-14 items-center justify-between">
          <h2 className="font-marca text-2xl font-bold tracking-tight">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="-mr-3 h-12 rounded-xl px-3 font-semibold text-texto-suave active:bg-superficie">
            Cancelar
          </button>
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => buscar(e.target.value)}
          placeholder="Buscar ejercicio"
          aria-label="Buscar ejercicio"
          enterKeyHint="search"
          className="h-14 w-full rounded-2xl border border-borde bg-superficie px-4 text-lg placeholder:text-texto-suave focus:border-lima focus:outline-none"
        />
        <div className="sin-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {[{ valor: null, etiqueta: 'Todos' }, ...GRUPOS_MUSCULARES].map((g) => (
            <button
              key={g.etiqueta}
              type="button"
              onClick={() => setGrupo(g.valor)}
              aria-pressed={grupo === g.valor}
              className={`h-11 shrink-0 rounded-full border px-4 font-semibold ${
                grupo === g.valor ? 'border-lima bg-lima text-fondo' : 'border-borde bg-superficie active:bg-borde'
              }`}
            >
              {g.etiqueta}
            </button>
          ))}
        </div>
        <div className="sin-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
          {[{ valor: null, etiqueta: 'Todo equipo' }, ...EQUIPOS].map((q) => (
            <button
              key={q.etiqueta}
              type="button"
              onClick={() => setEquipo(q.valor)}
              aria-pressed={equipo === q.valor}
              className={`h-11 shrink-0 rounded-full border px-4 font-semibold ${
                equipo === q.valor ? 'border-lima bg-lima text-fondo' : 'border-borde bg-superficie active:bg-borde'
              }`}
            >
              {q.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <ul className="mx-auto w-full max-w-lg flex-1 divide-y divide-borde overflow-y-auto px-4 pb-4">
        {mostrarSugeridos && (
          <>
            <li className="pt-4 pb-2 text-sm font-bold tracking-wide text-lima uppercase">Alternativas parecidas</li>
            {sugeridos.map((e) => fila(e, `s${e.id}`))}
            <li className="pt-6 pb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">Todos</li>
          </>
        )}
        {filtrados.slice(0, limite).map((e) => fila(e))}
        {filtrados.length > limite && (
          <li className="py-4">
            <button
              type="button"
              onClick={() => setLimite((l) => l + POR_PAGINA)}
              className="h-14 w-full rounded-2xl border border-borde bg-superficie text-lg font-semibold active:bg-borde"
            >
              Mostrar más ({filtrados.length - limite} restantes)
            </button>
          </li>
        )}
        {ejercicios && filtrados.length === 0 && (
          <li className="py-8 text-center text-texto-suave">No encontramos ejercicios. Puedes crearlos en la tab Ejercicios.</li>
        )}
      </ul>

      <div className={`pb-safe border-t border-borde bg-superficie ${unico ? 'hidden' : ''}`}>
        <div className="mx-auto max-w-lg p-4">
          <button
            type="button"
            disabled={elegidos.length === 0}
            onClick={() => onAgregar(elegidos)}
            className="h-16 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro disabled:bg-borde disabled:text-texto-suave"
          >
            {elegidos.length === 0 ? 'Elige ejercicios' : `Agregar ${elegidos.length} ${elegidos.length === 1 ? 'ejercicio' : 'ejercicios'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
