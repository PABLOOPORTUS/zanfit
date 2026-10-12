import { Link, useParams } from 'react-router-dom'
import DatosEntreno from '../../components/DatosEntreno'
import Medalla from '../../components/Medalla'
import NotasEntreno from '../../components/NotasEntreno'
import { useUnidad } from '../../hooks/useAjustes'
import { useLogros } from '../../hooks/useLogros'
import { useResumenEntreno } from '../../hooks/useWorkouts'
import { equivalencia } from '../../lib/logros'
import { formatearFechaLarga } from '../../lib/formato'

/** `/entrenar/resumen/:id`: se muestra al finalizar un entreno. */
export default function ResumenEntreno() {
  const id = Number(useParams().id)
  const resumen = useResumenEntreno(id)
  const logros = useLogros()
  const u = useUnidad()
  if (resumen === undefined || logros === undefined) return null
  if (resumen === null) {
    return (
      <section>
        <p className="rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">No encontramos este entreno.</p>
        <Link to="/entrenar" className="mt-4 flex h-14 items-center justify-center rounded-2xl bg-lima font-bold text-fondo">
          Volver a Entrenar
        </Link>
      </section>
    )
  }

  const cosa = equivalencia(resumen.volumen)
  const nuevos = logros.filter((l) => l.desbloqueado?.workoutId === id)

  return (
    <section>
      <p className="font-semibold text-lima">Entreno terminado</p>
      <h1 className="font-marca text-4xl font-bold tracking-tight">¡Buen trabajo!</h1>
      <p className="mt-1 text-texto-suave">
        {resumen.workout.nombre} · {formatearFechaLarga(resumen.workout.fechaInicio)}
      </p>

      {cosa && (
        <p className="mt-4 rounded-2xl border border-borde bg-superficie p-4 text-lg leading-snug">
          Levantaste <span className="font-bold text-lima">{u.volumen(resumen.volumen)}</span> en total: más que {cosa}.
        </p>
      )}

      {nuevos.length > 0 && (
        <div className="mt-4 rounded-2xl border border-lima bg-lima/10 p-4">
          <p className="font-marca text-xl font-bold text-lima">
            {nuevos.length === 1 ? '¡Logro desbloqueado!' : `¡${nuevos.length} logros desbloqueados!`}
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {nuevos.map((l, i) => (
              <li key={l.id} className="flex animate-aparecer items-center gap-3" style={{ animationDelay: `${i * 150}ms` }}>
                <Medalla categoria={l.categoria} ganada />
                <div>
                  <p className="font-semibold">{l.titulo}</p>
                  <p className="text-sm text-texto-suave">{l.descripcion}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <DatosEntreno resumen={resumen} />
      </div>

      <div className="mt-6">
        <NotasEntreno workoutId={id} inicial={resumen.workout.notas} />
      </div>

      <Link
        to="/entrenar"
        replace
        className="mt-6 flex h-16 items-center justify-center rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro"
      >
        Listo
      </Link>
      <Link
        to={`/progreso/entrenos/${id}`}
        className="mt-3 flex h-14 items-center justify-center rounded-2xl border border-borde bg-superficie font-semibold active:bg-borde"
      >
        Ver detalle en Progreso
      </Link>
    </section>
  )
}
