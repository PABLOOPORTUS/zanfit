import { Link } from 'react-router-dom'
import MetaSemanal from '../../components/MetaSemanal'
import MiniaturaEjercicio from '../../components/MiniaturaEjercicio'
import { iniciarEntreno } from '../../db/workouts'
import { useExercises } from '../../hooks/useExercises'
import { useCuenta } from '../../hooks/useCuenta'
import { usePerfil, usePlan } from '../../hooks/usePlan'
import { useRoutines } from '../../hooks/useRoutines'
import { useUltimoEntreno } from '../../hooks/useWorkouts'
import { formatearFecha } from '../../lib/formato'

export default function ElegirEntreno() {
  const rutinas = useRoutines()
  const ultimo = useUltimoEntreno()
  const perfil = usePerfil()
  const datosPlan = usePlan()
  const ejercicios = useExercises()
  const { usuario } = useCuenta()
  if (rutinas === undefined || ultimo === undefined || perfil === undefined || datosPlan === undefined || ejercicios === undefined) return null
  const porId = new Map(ejercicios.map((e) => [e.id!, e]))
  const hoy = datosPlan?.rutinas.find((r) => r.id === datosPlan.siguienteId)
  const delPlan = new Set(datosPlan?.plan.rutinaIds)

  return (
    <section>
      <h1 className="font-marca text-3xl font-bold tracking-tight">{usuario ? `Hola, ${usuario.nombre}` : 'Entrenar'}</h1>
      {ultimo && (
        <p className="mt-1 text-texto-suave">
          Último entreno: {ultimo.nombre}, {formatearFecha(ultimo.fechaInicio)}
        </p>
      )}

      <div className="mt-4">
        <MetaSemanal />
      </div>

      {hoy ? (
        <div className="mt-4 rounded-2xl border border-lima bg-lima/10 p-4">
          <p className="text-sm font-bold tracking-wide text-lima uppercase">Tu plan · Hoy te toca</p>
          <p className="mt-1 font-marca text-2xl leading-tight font-bold tracking-tight">{hoy.nombre.replace(/^Plan · /, '')}</p>
          <p className="text-sm text-texto-suave">{hoy.ejercicios.length} ejercicios</p>
          <ul className="sin-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
            {hoy.ejercicios.map((e) => {
              const ejercicio = porId.get(e.exerciseId)
              return (
                ejercicio && (
                  <li key={e.exerciseId} className="w-24 shrink-0">
                    <MiniaturaEjercicio ejercicio={ejercicio} className="h-16 w-24" />
                    <p className="mt-1 line-clamp-2 text-xs leading-tight text-texto-suave">{ejercicio.nombre}</p>
                  </li>
                )
              )
            })}
          </ul>
          <button type="button" onClick={() => iniciarEntreno(hoy.id)} className="mt-4 h-16 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro">
            Empezar
          </button>
          <Link to="/plan" className="mt-2 flex h-12 items-center justify-center font-semibold text-lima">
            Ver mi plan
          </Link>
        </div>
      ) : (
        perfil === null && (
          <Link to="/evaluacion" className="mt-6 block rounded-2xl border border-lima/60 bg-superficie p-4 active:bg-borde">
            <p className="font-marca text-xl font-bold">Arma tu plan personalizado</p>
            <p className="mt-1 text-texto-suave">Responde 9 preguntas y te armamos un plan según tu objetivo, tu experiencia y tu tiempo.</p>
            <span className="mt-3 inline-flex h-12 items-center rounded-xl bg-lima px-5 font-bold text-fondo">Empezar evaluación</span>
          </Link>
        )
      )}

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">{hoy ? 'Otras rutinas' : 'Elige una rutina'}</h2>
      {rutinas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center">
          <p className="text-texto-suave">Todavía no tienes rutinas.</p>
          <Link to="/rutinas/nueva" className="mt-4 inline-flex h-14 items-center rounded-2xl border border-lima/60 px-6 font-semibold text-lima active:bg-lima/10">
            Crear rutina
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rutinas.filter((r) => !hoy || r.id !== hoy.id).map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => iniciarEntreno(r.id)}
                disabled={r.ejercicios.length === 0}
                className="flex min-h-20 w-full items-center gap-3 rounded-2xl border border-borde bg-superficie p-4 text-left active:bg-borde disabled:opacity-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-marca text-2xl leading-tight font-bold tracking-tight break-words">{r.nombre}</span>
                  <span className="text-sm text-texto-suave">
                    {delPlan.has(r.id!) && <span className="font-semibold text-lima">Plan · </span>}
                    {r.ejercicios.length} {r.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'}
                  </span>
                </span>
                <span className="flex h-12 items-center gap-1 rounded-full bg-lima pr-4 pl-3 font-bold text-fondo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Empezar
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => iniciarEntreno()}
        className="mt-4 h-16 w-full rounded-2xl border border-borde bg-superficie text-lg font-semibold active:bg-borde"
      >
        Entreno libre
      </button>
      <p className="mt-2 text-center text-sm text-texto-suave">Sin rutina: agregas los ejercicios sobre la marcha.</p>

      {!usuario && (
        <Link to="/cuenta?modo=registro" className="mt-8 block rounded-2xl border border-borde bg-superficie p-4 active:bg-borde">
          <p className="font-semibold">No pierdas tu progreso</p>
          <p className="mt-1 text-sm text-texto-suave">Crea tu cuenta gratis y guarda tus entrenos, récords y logros en la nube.</p>
          <span className="mt-2 inline-block font-semibold text-lima">Crear cuenta ›</span>
        </Link>
      )}
    </section>
  )
}
