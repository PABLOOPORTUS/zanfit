import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BotonFlotante from '../../components/BotonFlotante'
import MiniaturaEjercicio from '../../components/MiniaturaEjercicio'
import { useExercises } from '../../hooks/useExercises'
import { esGrupoMuscular, etiquetaEquipo, etiquetaGrupo, GRUPOS_MUSCULARES } from '../../lib/catalogos'
import { normalizar } from '../../lib/texto'
import type { GrupoMuscular } from '../../types'

export default function ListaEjercicios() {
  const ejercicios = useExercises()
  // Búsqueda y filtro se guardan en la URL (?q=&grupo=) para que se mantengan al volver desde el detalle.
  // El texto del buscador usa estado local: leerlo directo de la URL hace que se pierdan teclas.
  const [params, setParams] = useSearchParams()
  const [busqueda, setBusquedaLocal] = useState(() => params.get('q') ?? '')
  const grupoParam = params.get('grupo')
  const grupo = esGrupoMuscular(grupoParam) ? grupoParam : null

  function guardarEnUrl(clave: 'q' | 'grupo', valor: string | null) {
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

  const secciones = useMemo(() => {
    // Cada palabra debe aparecer en el nombre, el grupo o el equipo: "press mancuernas" encuentra "Press inclinado con mancuernas".
    const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean)
    const filtrados = (ejercicios ?? []).filter((e) => {
      if (grupo !== null && e.grupoMuscular !== grupo) return false
      const texto = normalizar(`${e.nombre} ${etiquetaGrupo(e.grupoMuscular)} ${etiquetaEquipo(e.equipo)}`)
      return palabras.every((p) => texto.includes(p))
    })
    return GRUPOS_MUSCULARES.map((g) => ({
      ...g,
      ejercicios: filtrados.filter((e) => e.grupoMuscular === g.valor),
    })).filter((s) => s.ejercicios.length > 0)
  }, [ejercicios, busqueda, grupo])

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

      {ejercicios === undefined ? null : secciones.length > 0 ? (
        secciones.map((s) => (
          <div key={s.valor} className="mt-6">
            <h2 className="mb-2 flex items-baseline gap-2 px-1 text-sm font-bold tracking-wide text-texto-suave uppercase">
              {s.etiqueta}
              <span className="font-normal">{s.ejercicios.length}</span>
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
                      <span className="shrink-0 rounded-full border border-lima/60 px-2 py-0.5 text-xs font-semibold text-lima">
                        Propio
                      </span>
                    )}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-texto-suave" aria-hidden>
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center">
          <p className="text-texto-suave">
            {nombreBuscado ? `No encontramos «${nombreBuscado}».` : 'No hay ejercicios en este grupo.'}
          </p>
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
