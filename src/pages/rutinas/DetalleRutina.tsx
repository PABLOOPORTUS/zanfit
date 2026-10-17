import { Link, useNavigate, useParams } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import BotonCambiarEjercicio from '../../components/BotonCambiarEjercicio'
import MiniaturaEjercicio from '../../components/MiniaturaEjercicio'
import ZonaEliminar from '../../components/ZonaEliminar'
import { duplicarRutina, eliminarRutina, reemplazarEnRutina } from '../../db/routines'
import { iniciarEntreno } from '../../db/workouts'
import { useUnidad } from '../../hooks/useAjustes'
import { useExercises } from '../../hooks/useExercises'
import { usePerfil } from '../../hooks/usePlan'
import { useRoutine } from '../../hooks/useRoutines'
import { useEntrenoActivo } from '../../hooks/useWorkouts'
import { formatearDescanso } from '../../lib/formato'
import { caloriasRutina, PESO_POR_DEFECTO } from '../../lib/calorias'
import { duracionEstimada } from '../../lib/plan'
import type { Exercise } from '../../types'
import { esCardio, objetivoCardio } from '../../lib/cardio'
import RutinaNoEncontrada from './RutinaNoEncontrada'

export default function DetalleRutina() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const rutina = useRoutine(id)
  const ejercicios = useExercises()
  const activo = useEntrenoActivo()
  const u = useUnidad()
  const perfil = usePerfil()

  if (rutina === undefined || ejercicios === undefined || activo === undefined) return null
  if (rutina === null) return <RutinaNoEncontrada />
  const porId = new Map(ejercicios.map((e) => [e.id!, e]))

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
      <h1 className="mt-2 font-marca text-3xl font-bold tracking-tight">{rutina.nombre}</h1>
      {rutina.foco && (
        <p className="mt-1 text-texto-suave">
          {rutina.foco} · ~{duracionEstimada(rutina)} min · ~
          {caloriasRutina(rutina, duracionEstimada(rutina), porId, perfil?.pesoKg ?? PESO_POR_DEFECTO)} kcal
        </p>
      )}
      {rutina.nota && <p className="mt-3 rounded-2xl border border-lima/40 bg-lima/10 p-4 leading-snug">{rutina.nota}</p>}

      {rutina.calentamiento && rutina.calentamiento.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">Calentamiento sugerido</h2>
          <ol className="divide-y divide-borde overflow-hidden rounded-2xl bg-superficie">
            {rutina.calentamiento.map((c) => (
              <li key={c.exerciseId}>
                <FilaEjercicio ejercicio={porId.get(c.exerciseId)} detalle={formatearDuracion(c.segundos)} />
              </li>
            ))}
          </ol>
          <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">Ejercicios</h2>
        </>
      )}

      <ol
        className={`${rutina.calentamiento?.length ? '' : 'mt-6'} divide-y divide-borde overflow-hidden rounded-2xl bg-superficie`}
      >
        {rutina.ejercicios.map((e, i) => (
          <li key={e.exerciseId} className="flex items-center">
            <div className="min-w-0 flex-1">
              <FilaEjercicio
                numero={i + 1}
                ejercicio={porId.get(e.exerciseId)}
                detalle={`${porId.get(e.exerciseId) && esCardio(porId.get(e.exerciseId)!) ? objetivoCardio(e.seriesObjetivo, e.repsObjetivo) : `${e.seriesObjetivo} × ${e.repsObjetivo} reps`}${e.pesoSugerido ? ` · ${u.peso(e.pesoSugerido, 1)} sugerido` : ''} · descanso ${formatearDescanso(e.descansoSeg)}${e.nota ? ` · ${e.nota}` : ''}`}
              />
            </div>
            {porId.get(e.exerciseId) && (
              <BotonCambiarEjercicio
                ejercicio={porId.get(e.exerciseId)!}
                excluir={rutina.ejercicios.map((x) => x.exerciseId)}
                onElegir={(nuevo) => reemplazarEnRutina(id, e.exerciseId, nuevo)}
              />
            )}
          </li>
        ))}
        {rutina.ejercicios.length === 0 && <li className="p-4 text-texto-suave">Esta rutina no tiene ejercicios.</li>}
      </ol>

      {activo ? (
        <Link
          to="/entrenar"
          className="mt-6 flex h-13 items-center justify-center rounded-2xl bg-lima font-bold text-fondo active:bg-lima-oscuro"
        >
          Continuar entreno en curso
        </Link>
      ) : (
        <button
          type="button"
          onClick={empezar}
          disabled={rutina.ejercicios.length === 0}
          className="mt-6 h-13 w-full rounded-2xl bg-lima font-bold text-fondo active:bg-lima-oscuro disabled:opacity-50"
        >
          Empezar entreno
        </button>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          to={`/rutinas/${id}/editar`}
          className="flex h-12 items-center justify-center rounded-2xl bg-superficie font-semibold active:bg-borde"
        >
          Editar
        </Link>
        <button type="button" onClick={duplicar} className="h-12 rounded-2xl bg-superficie font-semibold active:bg-borde">
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

function FilaEjercicio({ numero, ejercicio, detalle }: { numero?: number; ejercicio?: Exercise; detalle: string }) {
  const contenido = (
    <>
      {numero !== undefined && <span className="w-5 shrink-0 font-marca text-lg font-bold text-texto-suave">{numero}</span>}
      {ejercicio && <MiniaturaEjercicio ejercicio={ejercicio} className="h-14 w-20" />}
      <div className="min-w-0 flex-1">
        <p className="text-lg leading-snug font-semibold">{ejercicio?.nombre ?? 'Ejercicio eliminado'}</p>
        <p className="text-sm text-texto-suave">{detalle}</p>
      </div>
    </>
  )
  // Tocar el ejercicio lleva a su ficha (fotos, pasos y músculos).
  return ejercicio ? (
    <Link to={`/ejercicios/${ejercicio.id}`} className="flex items-center gap-3 px-3 py-2.5 active:bg-borde">
      {contenido}
    </Link>
  ) : (
    <div className="flex items-center gap-3 px-3 py-2.5">{contenido}</div>
  )
}

const formatearDuracion = (segundos: number) => (segundos >= 60 ? `${Math.round(segundos / 60)} min` : `${segundos} s`)
