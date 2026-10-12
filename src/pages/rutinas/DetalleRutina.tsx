import { Link, useNavigate, useParams } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import ZonaEliminar from '../../components/ZonaEliminar'
import { duplicarRutina, eliminarRutina } from '../../db/routines'
import { iniciarEntreno } from '../../db/workouts'
import { useExercises } from '../../hooks/useExercises'
import { useRoutine } from '../../hooks/useRoutines'
import { useEntrenoActivo } from '../../hooks/useWorkouts'
import { formatearDescanso } from '../../lib/formato'
import RutinaNoEncontrada from './RutinaNoEncontrada'

export default function DetalleRutina() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const rutina = useRoutine(id)
  const ejercicios = useExercises()
  const activo = useEntrenoActivo()

  if (rutina === undefined || ejercicios === undefined || activo === undefined) return null
  if (rutina === null) return <RutinaNoEncontrada />
  const nombres = new Map(ejercicios.map((e) => [e.id!, e.nombre]))

  async function empezar() {
    await iniciarEntreno(id)
    navigate('/entrenar')
  }

  async function duplicar() {
    const copia = await duplicarRutina(id)
    navigate(`/rutinas/${copia}`)
  }

  return (
    <section>
      <BotonVolver to="/rutinas">Rutinas</BotonVolver>
      <h1 className="mt-2 font-marca text-4xl font-bold tracking-tight">{rutina.nombre}</h1>

      <ol className="mt-6 divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-superficie">
        {rutina.ejercicios.map((e, i) => (
          <li key={e.exerciseId} className="flex items-center gap-3 px-4 py-3">
            <span className="w-6 shrink-0 font-marca text-lg font-bold text-texto-suave">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">{nombres.get(e.exerciseId) ?? 'Ejercicio eliminado'}</p>
              <p className="text-sm text-texto-suave">
                {e.seriesObjetivo} × {e.repsObjetivo} reps · descanso {formatearDescanso(e.descansoSeg)}
              </p>
            </div>
          </li>
        ))}
        {rutina.ejercicios.length === 0 && <li className="p-4 text-texto-suave">Esta rutina no tiene ejercicios.</li>}
      </ol>

      {activo ? (
        <Link
          to="/entrenar"
          className="mt-6 flex h-16 items-center justify-center rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro"
        >
          Continuar entreno en curso
        </Link>
      ) : (
        <button
          type="button"
          onClick={empezar}
          disabled={rutina.ejercicios.length === 0}
          className="mt-6 h-16 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro disabled:opacity-50"
        >
          Empezar entreno
        </button>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          to={`/rutinas/${id}/editar`}
          className="flex h-14 items-center justify-center rounded-2xl border border-borde bg-superficie font-semibold active:bg-borde"
        >
          Editar
        </Link>
        <button type="button" onClick={duplicar} className="h-14 rounded-2xl border border-borde bg-superficie font-semibold active:bg-borde">
          Duplicar
        </button>
      </div>

      <div className="mt-8">
        <ZonaEliminar
          boton="Eliminar rutina"
          pregunta={`¿Eliminar «${rutina.nombre}»?`}
          detalle="Los entrenos que ya hiciste con esta rutina se mantienen en tu historial."
          onEliminar={async () => {
            await eliminarRutina(id)
            navigate('/rutinas', { replace: true })
          }}
        />
      </div>
    </section>
  )
}
