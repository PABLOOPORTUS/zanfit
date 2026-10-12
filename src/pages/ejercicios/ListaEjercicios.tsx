import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BotonFlotante from '../../components/BotonFlotante'
import MiniaturaEjercicio from '../../components/MiniaturaEjercicio'
import { useExercises } from '../../hooks/useExercises'
import { EQUIPOS, esGrupoMuscular, etiquetaEquipo, GRUPOS_MUSCULARES } from '../../lib/catalogos'
import { filtrarEjercicios, POR_PAGINA } from '../../lib/filtroEjercicios'
import { CATEGORIAS, type Categoria } from '../../lib/musculos'
import type { Equipo, GrupoMuscular } from '../../types'

const TIPOS = Object.entries(CATEGORIAS) as [Categoria, string][]

export default function ListaEjercicios() {
  const ejercicios = useExercises()
  // Búsqueda y filtros se guardan en la URL (?q=&grupo=&equipo=&tipo=) para que se mantengan al volver desde el detalle.
  // El texto del buscador usa estado local: leerlo directo de la URL hace que se pierdan teclas.
  const [params, setParams] = useSearchParams()
  const [busqueda, setBusquedaLocal] = useState(() => params.get('q') ?? '')
  const grupoParam = params.get('grupo')
  const grupo = esGrupoMuscular(grupoParam) ? grupoParam : null
  const equipo = EQUIPOS.find((e) => e.valor === params.get('equipo'))?.valor ?? null
  const tipo = TIPOS.find(([t]) => t === params.get('tipo'))?.[0] ?? null
  const [limite, setLimite] = useState(POR_PAGINA)

  function guardarEnUrl(clave: 'q' | 'grupo' | 'equipo' | 'tipo', valor: string | null) {
    setLimite(POR_PAGINA)
    setParams(
      (anteriores) => {
        const siguiente = new URLSearchParams(anteriores)
        if (valor) siguiente.set(clave, valor)
        else siguiente.delete(clave)
        return siguiente
      },
      { replace: true },
    )
  }
  function setBusqueda(q: string) {
    setBusquedaLocal(q)
    guardarEnUrl('q', q.trim() ? q : null)
  }
  const setGrupo = (g: GrupoMuscular | null) => guardarEnUrl('grupo', g)
  const setEquipo = (e: Equipo | null) => guardarEnUrl('equipo', e)
  const setTipo = (t: Categoria | null) => guardarEnUrl('tipo', t)

  const filtrados = useMemo(() => filtrarEjercicios(ejercicios ?? [], { busqueda, grupo, equipo, tipo }), [ejercicios, busqueda, grupo, equipo, tipo])
  // Agrupados por grupo muscular; solo se dibujan los primeros `limite` (con 800+ ejercicios, todos juntos traban la lista).
  const secciones = useMemo(() => {
    const visibles = GRUPOS_MUSCULARES.flatMap((g) => filtrados.filter((e) => e.grupoMuscular === g.valor)).slice(0, limite)
    return GRUPOS_MUSCULARES.map((g) => ({
      ...g,
      total: filtrados.filter((e) => e.grupoMuscular === g.valor).length,
      ejercicios: visibles.filter((e) => e.grupoMuscular === g.valor),
    })).filter((s) => s.ejercicios.length > 0)
  }, [filtrados, limite])

  const nombreBuscado = busqueda.trim()

  return (
    <section className="pb-20">
      <div className="flex items-baseline justify-between">
        <h1 className="font-marca text-3xl font-bold tracking-tight">Ejercicios</h1>
        {ejercicios && <span className="text-sm text-texto-suave">{ejercicios.length} en total</span>}
      </div>

      <div className="relative mt-4">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar ejercicio"
          aria-label="Buscar ejercicio"
          enterKeyHint="search"
          className="h-14 w-full rounded-2xl border border-borde bg-superficie pr-14 pl-4 text-lg placeholder:text-texto-suave focus:border-lima focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            aria-label="Borrar búsqueda"
            className="absolute top-1 right-1 flex size-12 items-center justify-center rounded-xl text-texto-suave active:bg-borde"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      <div className="sin-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip activo={grupo === null} onClick={() => setGrupo(null)}>
          Todos
        </Chip>
        {GRUPOS_MUSCULARES.map((g) => (
          <Chip key={g.valor} activo={grupo === g.valor} onClick={() => setGrupo(grupo === g.valor ? null : g.valor)}>
            {g.etiqueta}
          </Chip>
        ))}
      </div>
      <div className="sin-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip activo={equipo === null} onClick={() => setEquipo(null)}>
          Todo equipo
        </Chip>
        {EQUIPOS.map((e) => (
          <Chip key={e.valor} activo={equipo === e.valor} onClick={() => setEquipo(equipo === e.valor ? null : e.valor)}>
            {e.etiqueta}
          </Chip>
        ))}
      </div>
      <div className="sin-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip activo={tipo === null} onClick={() => setTipo(null)}>
          Todo tipo
        </Chip>
        {TIPOS.map(([t, etiqueta]) => (
          <Chip key={t} activo={tipo === t} onClick={() => setTipo(tipo === t ? null : t)}>
            {etiqueta}
          </Chip>
        ))}
      </div>
      {ejercicios && (grupo || equipo || tipo || busqueda.trim()) && (
        <p className="mt-3 px-1 text-sm text-texto-suave">
          {filtrados.length} {filtrados.length === 1 ? 'ejercicio' : 'ejercicios'}
        </p>
      )}

      {ejercicios === undefined ? null : secciones.length > 0 ? (
        <>
          {secciones.map((s) => (
            <div key={s.valor} className="mt-6">
              <h2 className="mb-2 flex items-baseline gap-2 px-1 text-sm font-bold tracking-wide text-texto-suave uppercase">
                {s.etiqueta}
                <span className="font-normal">{s.total}</span>
              </h2>
              <ul className="divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-superficie">
                {s.ejercicios.map((e) => (
                  <li key={e.id}>
                    <Link to={`/ejercicios/${e.id}`} className="flex min-h-16 items-center gap-3 px-3 py-2.5 active:bg-borde">
                      <MiniaturaEjercicio ejercicio={e} className="h-14 w-20" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-lg leading-snug font-semibold">{e.nombre}</p>
                        <p className="text-sm text-texto-suave">{etiquetaEquipo(e.equipo)}</p>
                      </div>
                      {e.propio && (
                        <span className="shrink-0 rounded-full border border-lima/60 px-2 py-0.5 text-xs font-semibold text-lima">Propio</span>
                      )}
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-texto-suave"
                        aria-hidden
                      >
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {filtrados.length > limite && (
            <button
              type="button"
              onClick={() => setLimite((l) => l + POR_PAGINA)}
              className="mt-6 h-14 w-full rounded-2xl border border-borde bg-superficie text-lg font-semibold active:bg-borde"
            >
              Mostrar más ({filtrados.length - limite} restantes)
            </button>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center">
          <p className="text-texto-suave">{nombreBuscado ? `No encontramos «${nombreBuscado}».` : 'No hay ejercicios con estos filtros.'}</p>
          {nombreBuscado && (
            <Link
              to={`/ejercicios/nuevo?${new URLSearchParams({ nombre: nombreBuscado, ...(grupo && { grupo }) })}`}
              className="mt-4 inline-flex h-14 items-center justify-center rounded-2xl bg-lima px-6 text-lg font-bold text-fondo active:bg-lima-oscuro"
            >
              Crear «{nombreBuscado}»
            </Link>
          )}
        </div>
      )}

      <BotonFlotante to={grupo ? `/ejercicios/nuevo?grupo=${grupo}` : '/ejercicios/nuevo'}>Crear</BotonFlotante>
    </section>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`h-11 shrink-0 rounded-full border px-4 font-semibold transition-colors ${
        activo ? 'border-lima bg-lima text-fondo' : 'border-borde bg-superficie text-texto active:bg-borde'
      }`}
    >
      {children}
    </button>
  )
}
