import { Link, useSearchParams } from 'react-router-dom'
import { useFechasEntrenadas, useHistorial, useRecordsPorEjercicio } from '../../hooks/useWorkouts'
import Medalla from '../../components/Medalla'
import { useUnidad } from '../../hooks/useAjustes'
import { useLogros } from '../../hooks/useLogros'
import { formatearDuracion, formatearFecha } from '../../lib/formato'
import CalendarioEntrenos from './CalendarioEntrenos'

const mesAnio = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' })
const diaSemana = new Intl.DateTimeFormat('es-CL', { weekday: 'short' })

export default function Progreso() {
  const [params, setParams] = useSearchParams()
  const vistaParam = params.get('vista')
  const vista = vistaParam === 'records' || vistaParam === 'logros' ? vistaParam : 'historial'
  const fechas = useFechasEntrenadas()

  if (fechas === undefined) return null

  return (
    <section>
      <h1 className="font-marca text-3xl font-bold tracking-tight">Progreso</h1>

      <div className="mt-4">
        <CalendarioEntrenos fechas={fechas} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl border border-borde bg-superficie p-1" role="tablist">
        {(['historial', 'records', 'logros'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vista === v}
            onClick={() => setParams(v === 'historial' ? {} : { vista: v }, { replace: true })}
            className={`h-12 rounded-xl font-semibold ${vista === v ? 'bg-lima text-fondo' : 'text-texto-suave active:bg-borde'}`}
          >
            {{ historial: 'Historial', records: 'Récords', logros: 'Logros' }[v]}
          </button>
        ))}
      </div>

      <div className="mt-4">{vista === 'historial' ? <Historial /> : vista === 'records' ? <Records /> : <Logros />}</div>
    </section>
  )
}

function Historial() {
  const filas = useHistorial()
  const u = useUnidad()
  if (filas === undefined) return null
  if (filas.length === 0) return <Vacio>Todavía no terminas ningún entreno. Cuando lo hagas, aparecerá aquí.</Vacio>

  const porMes = new Map<string, typeof filas>()
  for (const f of filas) {
    const clave = mesAnio.format(f.workout.fechaInicio)
    porMes.set(clave, [...(porMes.get(clave) ?? []), f])
  }

  return (
    <div className="flex flex-col gap-6">
      {[...porMes.entries()].map(([titulo, filasMes]) => (
        <div key={titulo}>
          <h2 className="mb-2 px-1 text-sm font-bold tracking-wide text-texto-suave uppercase">{titulo}</h2>
          <ul className="divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-superficie">
            {filasMes.map((f) => (
              <li key={f.workout.id}>
                <Link to={`/progreso/entrenos/${f.workout.id}`} className="flex min-h-16 items-center gap-4 px-4 py-3 active:bg-borde">
                  <div className="w-11 shrink-0 text-center">
                    <p className="text-xs text-texto-suave uppercase">{diaSemana.format(f.workout.fechaInicio).replace('.', '')}</p>
                    <p className="font-marca text-2xl leading-none font-bold">{new Date(f.workout.fechaInicio).getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-lg leading-snug font-semibold">{f.workout.nombre}</p>
                    <p className="text-sm text-texto-suave">
                      {formatearDuracion(f.duracionMs)} · {u.volumen(f.volumen)} · {f.series} {f.series === 1 ? 'serie' : 'series'}
                    </p>
                  </div>
                  <Chevron />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Records() {
  const records = useRecordsPorEjercicio()
  const u = useUnidad()
  if (records === undefined) return null
  if (records.length === 0) return <Vacio>Tus récords aparecen cuando completas series en un entreno.</Vacio>

  return (
    <>
      <p className="mb-3 px-1 text-sm text-texto-suave">1RM estimado con la fórmula de Epley: peso × (1 + reps / 30).</p>
      <ul className="divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-superficie">
        {records.map((r) => (
          <li key={r.exercise.id}>
            <Link to={`/progreso/ejercicios/${r.exercise.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 active:bg-borde">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-lg leading-snug font-semibold">{r.exercise.nombre}</p>
                <p className="text-sm text-texto-suave">Último: {formatearFecha(r.ultimaVez)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-marca text-lg leading-tight font-bold">
                  {u.peso(r.pesoMaximo)} <span className="text-sm font-normal text-texto-suave">× {r.repsPesoMaximo}</span>
                </p>
                <p className="text-sm text-texto-suave">1RM {u.peso(r.mejor1RM, 1)}</p>
              </div>
              <Chevron />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function Logros() {
  const logros = useLogros()
  if (logros === undefined) return null
  const ganados = logros.filter((l) => l.desbloqueado)
  const siguiente = logros.filter((l) => !l.desbloqueado).sort((a, b) => b.progreso / b.meta - a.progreso / a.meta)[0]
  const miles = new Intl.NumberFormat('es-CL')
  const n = (l: (typeof logros)[number]) => (l.categoria === 'volumen' ? `${miles.format(Math.round(l.progreso / 1000))}/${miles.format(l.meta / 1000)} t` : `${l.progreso}/${l.meta}`)
  return (
    <div>
      <p className="px-1 text-texto-suave">
        Tienes <span className="font-semibold text-texto">{ganados.length}</span> de {logros.length} logros.
        {siguiente && <> El próximo: <span className="font-semibold text-lima">{siguiente.titulo}</span> ({n(siguiente)}).</>}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {[...ganados.sort((a, b) => b.desbloqueado!.fecha - a.desbloqueado!.fecha), ...logros.filter((l) => !l.desbloqueado)].map((l) => (
          <li key={l.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${l.desbloqueado ? 'border-lima/40 bg-superficie' : 'border-borde bg-superficie'}`}>
            <Medalla categoria={l.categoria} ganada={!!l.desbloqueado} />
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${l.desbloqueado ? '' : 'text-texto-suave'}`}>{l.titulo}</p>
              <p className="text-sm text-texto-suave">{l.descripcion}</p>
              {l.desbloqueado ? (
                <p className="mt-0.5 text-xs font-semibold text-lima">Ganado el {formatearFecha(l.desbloqueado.fecha)}</p>
              ) : (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-borde">
                    <span className="block h-full rounded-full bg-lima/70" style={{ width: `${(l.progreso / l.meta) * 100}%` }} />
                  </span>
                  <span className="text-xs text-texto-suave tabular-nums">{n(l)}</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Vacio({ children }: { children: string }) {
  return <p className="rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">{children}</p>
}

function Chevron() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-texto-suave" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
