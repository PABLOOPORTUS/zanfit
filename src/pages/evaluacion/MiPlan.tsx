import { Link, useNavigate } from 'react-router-dom'
import ZonaEliminar from '../../components/ZonaEliminar'
import { eliminarPlan } from '../../db/plan'
import { iniciarEntreno } from '../../db/workouts'
import { useUnidad } from '../../hooks/useAjustes'
import { useExercises } from '../../hooks/useExercises'
import { usePerfil, usePlan } from '../../hooks/usePlan'
import { useEntrenoActivo } from '../../hooks/useWorkouts'
import { etiqueta, EXPERIENCIAS, LUGARES, OBJETIVOS, ZONAS } from '../../lib/evaluacion'
import { formatearDescanso } from '../../lib/formato'
import { DESCRIPCION_DIVISION, edad, imc, recomendaciones } from '../../lib/plan'

/** `/plan`: resultado de la evaluación y el plan generado. */
export default function MiPlan() {
  const navigate = useNavigate()
  const perfil = usePerfil()
  const datos = usePlan()
  const ejercicios = useExercises()
  const activo = useEntrenoActivo()
  const u = useUnidad()

  if (perfil === undefined || datos === undefined || ejercicios === undefined || activo === undefined) return null
  if (perfil === null || datos === null) {
    return (
      <section>
        <h1 className="font-marca text-3xl font-bold tracking-tight">Tu plan</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
          Todavía no tienes un plan. Responde la evaluación y te armamos uno a tu medida.
        </p>
        <Link to="/evaluacion" className="mt-4 flex h-16 items-center justify-center rounded-2xl bg-lima text-lg font-bold text-fondo">
          Hacer la evaluación
        </Link>
      </section>
    )
  }

  const { plan, rutinas, siguienteId } = datos
  const nombres = new Map(ejercicios.map((e) => [e.id!, e.nombre]))
  const { valor: valorImc, categoria } = imc(perfil)

  async function empezar(id: number) {
    await iniciarEntreno(id)
    navigate('/entrenar')
  }

  return (
    <section>
      <p className="font-semibold text-lima">Tu plan personalizado</p>
      <h1 className="font-marca text-3xl leading-tight font-bold tracking-tight">
        {rutinas.length} {rutinas.length === 1 ? 'día' : 'días'} por semana
      </h1>
      <p className="mt-2 text-texto-suave">{DESCRIPCION_DIVISION[plan.division]}</p>

      <div className="mt-6 rounded-2xl border border-borde bg-superficie p-4">
        <p className="font-semibold">
          {perfil.sexo === 'hombre' ? 'Hombre' : 'Mujer'} · {edad(perfil)} años · {u.peso(perfil.pesoKg, 1)} · {perfil.alturaCm} cm
        </p>
        <p className="mt-1 text-texto-suave">
          IMC <span className="font-semibold text-texto">{String(valorImc).replace('.', ',')}</span> ({categoria}). Es solo una referencia: no distingue
          músculo de grasa.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            etiqueta(OBJETIVOS, perfil.objetivo),
            etiqueta(EXPERIENCIAS, perfil.experiencia),
            etiqueta(LUGARES, perfil.lugar),
            `${perfil.minutosPorSesion} min`,
            ...perfil.zonas.map((z) => etiqueta(ZONAS, z)),
          ].map((t) => (
            <span key={t} className="rounded-full border border-borde px-3 py-1 text-sm font-semibold">
              {t}
            </span>
          ))}
        </div>
      </div>

      <h2 className="mt-8 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">Tu semana</h2>
      <ol className="flex flex-col gap-3">
        {rutinas.map((r) => {
          const toca = r.id === siguienteId
          return (
            <li key={r.id} className={`rounded-2xl border bg-superficie p-4 ${toca ? 'border-lima' : 'border-borde'}`}>
              <div className="flex items-start gap-2">
                <Link to={`/rutinas/${r.id}`} className="min-w-0 flex-1">
                  <p className="font-marca text-xl leading-tight font-bold">{r.nombre.replace(/^Plan · /, '')}</p>
                  <p className="text-sm text-texto-suave">{r.ejercicios.length} ejercicios · toca para ver o editar</p>
                </Link>
                {toca && <span className="shrink-0 rounded-full bg-lima px-2 py-0.5 text-xs font-bold text-fondo">Hoy</span>}
              </div>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {r.ejercicios.map((e) => (
                  <li key={e.exerciseId} className="flex justify-between gap-3">
                    <span className="min-w-0">{nombres.get(e.exerciseId) ?? 'Ejercicio eliminado'}</span>
                    <span className="shrink-0 text-right text-texto-suave tabular-nums">
                      {e.seriesObjetivo}×{e.repsObjetivo}
                      {e.pesoSugerido ? ` · ${u.peso(e.pesoSugerido, 1)}` : ''} · {formatearDescanso(e.descansoSeg)}
                    </span>
                  </li>
                ))}
              </ul>
              {toca && !activo && (
                <button type="button" onClick={() => empezar(r.id!)} className="mt-4 h-14 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro">
                  Empezar este día
                </button>
              )}
            </li>
          )
        })}
      </ol>

      <h2 className="mt-8 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">Recomendaciones</h2>
      <ul className="flex flex-col gap-2">
        {recomendaciones(perfil).map((r) => (
          <li key={r} className={`rounded-2xl border p-4 leading-snug ${r.startsWith('Respondiste') ? 'border-peligro/50 bg-peligro/10' : 'border-borde bg-superficie'}`}>
            {r}
          </li>
        ))}
      </ul>

      <Link to="/evaluacion" className="mt-8 flex h-14 items-center justify-center rounded-2xl border border-borde bg-superficie font-semibold active:bg-borde">
        Rehacer la evaluación
      </Link>
      <p className="mt-2 text-center text-sm text-texto-suave">Al rehacerla, las rutinas del plan se reemplazan. Tu historial se mantiene.</p>

      <div className="mt-6">
        <ZonaEliminar
          boton="Eliminar el plan"
          pregunta="¿Eliminar tu plan?"
          detalle="Se borran las rutinas del plan. Tu historial de entrenos y tu evaluación se mantienen."
          onEliminar={async () => {
            await eliminarPlan()
            navigate('/entrenar', { replace: true })
          }}
        />
      </div>
    </section>
  )
}
