import { useNavigate, useParams } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import DatosEntreno from '../../components/DatosEntreno'
import NotasEntreno from '../../components/NotasEntreno'
import ZonaEliminar from '../../components/ZonaEliminar'
import { eliminarEntreno } from '../../db/workouts'
import { useResumenEntreno } from '../../hooks/useWorkouts'
import { useUnidad } from '../../hooks/useAjustes'
import { formatearFechaLarga, formatearHora } from '../../lib/formato'
import { esCardio, textoCardio } from '../../lib/cardio'

/** `/progreso/entrenos/:id`. */
export default function DetalleEntreno() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const resumen = useResumenEntreno(id)
  const u = useUnidad()

  if (resumen === undefined) return null
  if (resumen === null) {
    return (
      <section>
        <BotonVolver to="/progreso">Progreso</BotonVolver>
        <p className="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
          No encontramos este entreno.
        </p>
      </section>
    )
  }
  const { workout } = resumen
  const conRecord = new Set(resumen.records.map((r) => r.exerciseId))

  return (
    <section>
      <BotonVolver to="/progreso">Progreso</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl font-bold tracking-tight">{workout.nombre}</h1>
      <p className="mt-1 text-texto-suave">
        {formatearFechaLarga(workout.fechaInicio)} · {formatearHora(workout.fechaInicio)}
        {workout.fechaFin && `–${formatearHora(workout.fechaFin)}`}
      </p>

      <div className="mt-6">
        <DatosEntreno resumen={resumen} />
      </div>

      <h2 className="mt-8 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">Ejercicios</h2>
      <div className="flex flex-col gap-3">
        {resumen.bloques.map((b) => (
          <div key={b.exercise.id} className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="flex items-center gap-2 text-lg font-semibold">
              {b.exercise.nombre}
              {conRecord.has(b.exercise.id!) && <span className="rounded-full bg-lima px-2 py-0.5 text-xs font-bold text-fondo">Récord</span>}
            </p>
            <ol className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {b.sets.map((s, i) => (
                <li key={s.id} className="contents">
                  <span className="text-texto-suave">
                    {esCardio(b.exercise) ? 'Tramo' : 'Serie'} {i + 1}
                  </span>
                  <span className="font-semibold tabular-nums">{esCardio(b.exercise) ? textoCardio(s) : `${u.peso(s.peso)} × ${s.reps}`}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <NotasEntreno workoutId={id} inicial={workout.notas} />
      </div>

      <div className="mt-8">
        <ZonaEliminar
          boton="Eliminar entreno"
          pregunta="¿Eliminar este entreno del historial?"
          detalle="Se borran sus series y deja de contar para tus récords."
          onEliminar={async () => {
            await eliminarEntreno(id)
            navigate('/progreso', { replace: true })
          }}
        />
      </div>
    </section>
  )
}
