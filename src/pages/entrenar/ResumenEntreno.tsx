import { Link, useParams } from 'react-router-dom'
import DatosEntreno from '../../components/DatosEntreno'
import NotasEntreno from '../../components/NotasEntreno'
import { useResumenEntreno } from '../../hooks/useWorkouts'
import { formatearFechaLarga } from '../../lib/formato'

/** `/entrenar/resumen/:id`: se muestra al finalizar un entreno. */
export default function ResumenEntreno() {
  const id = Number(useParams().id)
  const resumen = useResumenEntreno(id)
  if (resumen === undefined) return null
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

  return (
    <section>
      <p className="font-semibold text-lima">Entreno terminado</p>
      <h1 className="font-marca text-4xl font-bold tracking-tight">¡Buen trabajo!</h1>
      <p className="mt-1 text-texto-suave">
        {resumen.workout.nombre} · {formatearFechaLarga(resumen.workout.fechaInicio)}
      </p>

      <div className="mt-6">
        <DatosEntreno resumen={resumen} />
      </div>

      <div className="mt-6">
        <NotasEntreno workoutId={id} inicial={resumen.workout.notas} />
      </div>

      <Link to="/entrenar" replace className="mt-6 flex h-16 items-center justify-center rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro">
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
