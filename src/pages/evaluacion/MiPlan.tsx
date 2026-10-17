import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AvisoSalud from '../../components/AvisoSalud'
import BotonCambiarEjercicio from '../../components/BotonCambiarEjercicio'
import CuerpoMusculos from '../../components/CuerpoMusculos'
import MiniaturaEjercicio from '../../components/MiniaturaEjercicio'
import ZonaEliminar from '../../components/ZonaEliminar'
import { mediosDe } from '../../db/mediosEjercicios'
import { eliminarPlan, guardarEvaluacion } from '../../db/plan'
import { reemplazarEnRutina } from '../../db/routines'
import { iniciarEntreno } from '../../db/workouts'
import { useUnidad } from '../../hooks/useAjustes'
import { useExercises } from '../../hooks/useExercises'
import { usePerfil, usePlan } from '../../hooks/usePlan'
import { useEntrenoActivo } from '../../hooks/useWorkouts'
import {
  EQUIPAMIENTO_POR_DEFECTO,
  EQUIPOS_DISPONIBLES,
  etiqueta,
  EXPERIENCIAS,
  LESIONES,
  LUGARES,
  OBJETIVOS,
  pasosPara,
  ZONAS,
  type Paso,
} from '../../lib/evaluacion'
import { caloriasRutina } from '../../lib/calorias'
import { esCardio, objetivoCardio } from '../../lib/cardio'
import { MENSAJE_SIN_IA } from '../../lib/clienteIa'
import { formatearDescanso } from '../../lib/formato'
import { DESCRIPCION_DIVISION, duracionEstimada, edad, imc, recomendaciones } from '../../lib/plan'
import { vistaPrincipal } from '../../lib/musculos'
import type { Perfil, Plan } from '../../types'

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
        <h1 className="font-marca text-3xl font-semibold tracking-tight">Tu plan</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
          Todavía no tienes un plan. Responde la evaluación y te armamos uno a tu medida.
        </p>
        <Link to="/evaluacion" className="mt-4 flex h-13 items-center justify-center rounded-2xl bg-lima font-semibold text-fondo">
          Hacer la evaluación
        </Link>
      </section>
    )
  }

  const { plan, rutinas, siguienteId } = datos
  const porId = new Map(ejercicios.map((e) => [e.id!, e]))
  const { valor: valorImc, categoria } = imc(perfil)

  async function empezar(id: number) {
    await iniciarEntreno(id)
    navigate('/entrenar')
  }

  return (
    <section>
      <p className="font-semibold text-lima">Tu plan personalizado</p>
      <h1 className="font-marca text-3xl leading-tight font-semibold tracking-tight">
        {rutinas.length} {rutinas.length === 1 ? 'día' : 'días'} por semana
      </h1>
      <p className="mt-2 text-texto-suave">{DESCRIPCION_DIVISION[plan.division]}</p>
      <OrigenPlan perfil={perfil} origen={plan.origen} motivo={plan.motivoSinIa} />

      <div className="mt-6 rounded-2xl bg-superficie p-4">
        <p className="font-semibold">
          {perfil.sexo === 'hombre' ? 'Hombre' : 'Mujer'} · {edad(perfil)} años · {u.peso(perfil.pesoKg, 1)} · {perfil.alturaCm} cm
        </p>
        <p className="mt-1 text-texto-suave">
          IMC <span className="font-semibold text-texto">{String(valorImc).replace('.', ',')}</span> ({categoria}). Es solo una referencia: no
          distingue músculo de grasa.
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

      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">Tu semana</h2>
      <ol className="flex flex-col gap-3">
        {rutinas.map((r) => {
          const toca = r.id === siguienteId
          return (
            <li key={r.id} className={`rounded-2xl border bg-superficie p-4 ${toca ? 'border-lima' : 'border-borde'}`}>
              <div className="flex items-start gap-2">
                <Link to={`/rutinas/${r.id}`} className="min-w-0 flex-1">
                  <p className="font-marca text-xl leading-tight font-semibold">{r.nombre.replace(/^Plan · /, '')}</p>
                  {r.foco && <p className="text-texto-suave">{r.foco}</p>}
                  <p className="text-sm text-texto-suave">
                    {r.ejercicios.length} ejercicios · ~{duracionEstimada(r)} min · ~{caloriasRutina(r, duracionEstimada(r), porId, perfil.pesoKg)}{' '}
                    kcal
                  </p>
                </Link>
                {toca && <span className="shrink-0 rounded-full bg-lima px-2 py-0.5 text-xs font-semibold text-fondo">Hoy</span>}
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {r.ejercicios.map((e) => {
                  const ejercicio = porId.get(e.exerciseId)
                  return (
                    <li key={e.exerciseId} className="flex items-center gap-1">
                      <Link
                        to={ejercicio ? `/ejercicios/${ejercicio.id}` : '#'}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl active:bg-borde"
                      >
                        {ejercicio && <MiniaturaEjercicio ejercicio={ejercicio} className="h-12 w-16" />}
                        <span className="min-w-0 flex-1">
                          <span className="block leading-snug font-semibold">{ejercicio?.nombre ?? 'Ejercicio eliminado'}</span>
                          <span className="text-sm text-texto-suave tabular-nums">
                            {ejercicio && esCardio(ejercicio)
                              ? objetivoCardio(e.seriesObjetivo, e.repsObjetivo)
                              : `${e.seriesObjetivo}×${e.repsObjetivo}`}
                            {e.pesoSugerido ? ` · ${u.peso(e.pesoSugerido, 1)}` : ''} · {formatearDescanso(e.descansoSeg)}
                          </span>
                        </span>
                        {ejercicio && (
                          <CuerpoMusculos
                            musculos={mediosDe(ejercicio).musculos}
                            vista={vistaPrincipal(mediosDe(ejercicio).musculos)}
                            className="w-7 shrink-0"
                          />
                        )}
                      </Link>
                      {ejercicio && (
                        <BotonCambiarEjercicio
                          ejercicio={ejercicio}
                          excluir={r.ejercicios.map((x) => x.exerciseId)}
                          onElegir={(nuevo) => reemplazarEnRutina(r.id!, e.exerciseId, nuevo)}
                          rutinaId={r.id}
                          className="h-12 w-14 rounded-xl"
                        />
                      )}
                    </li>
                  )
                })}
              </ul>
              {toca && !activo && (
                <button
                  type="button"
                  onClick={() => empezar(r.id!)}
                  className="mt-4 h-12 w-full rounded-2xl bg-lima font-semibold text-fondo active:bg-lima-oscuro"
                >
                  Empezar este día
                </button>
              )}
            </li>
          )
        })}
      </ol>

      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">Recomendaciones</h2>
      <ul className="flex flex-col gap-2">
        {recomendaciones(perfil).map((r) => (
          <li
            key={r}
            className={`rounded-2xl border p-4 leading-snug ${r.startsWith('Respondiste') ? 'border-peligro/50 bg-peligro/10' : 'border-borde bg-superficie'}`}
          >
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <AvisoSalud />
      </div>

      <Respuestas perfil={perfil} />

      <Link
        to="/evaluacion"
        className="mt-8 flex h-12 items-center justify-center rounded-2xl bg-superficie font-semibold active:bg-borde"
      >
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

/** Cada respuesta de la evaluación con un botón para cambiar solo esa (abre `/evaluacion?paso=N&editar=1`). */
function Respuestas({ perfil }: { perfil: Perfil }) {
  const u = useUnidad()
  const pasos = pasosPara(perfil.lugar)
  const lista = (valores: string[]) => (valores.length ? valores.join(', ') : 'Ninguna')
  const filas: [Paso, string, string][] = [
    ['sexo', 'Sexo', perfil.sexo === 'hombre' ? 'Hombre' : 'Mujer'],
    ['datos', 'Edad, peso y altura', `${edad(perfil)} años · ${u.peso(perfil.pesoKg, 1)} · ${perfil.alturaCm} cm`],
    ['objetivo', 'Objetivo', etiqueta(OBJETIVOS, perfil.objetivo)],
    ['zonas', 'Quiero mejorar', lista(perfil.zonas.map((z) => etiqueta(ZONAS, z)))],
    ['experiencia', 'Experiencia', etiqueta(EXPERIENCIAS, perfil.experiencia)],
    ['lugar', 'Dónde entreno', etiqueta(LUGARES, perfil.lugar)],
    ...(perfil.lugar !== 'gimnasio'
      ? [
          ['equipo', 'Equipo', lista((perfil.equipamiento ?? EQUIPAMIENTO_POR_DEFECTO).map((q) => etiqueta(EQUIPOS_DISPONIBLES, q)))] as [
            Paso,
            string,
            string,
          ],
        ]
      : []),
    ['frecuencia', 'Tiempo', `${perfil.diasPorSemana} días · ${perfil.minutosPorSesion} min`],
    ['lesiones', 'Lesiones', lista(perfil.lesiones.map((l) => etiqueta(LESIONES, l)))],
    ['salud', 'Salud', perfil.precaucion ? 'Con alguna alerta' : 'Sin alertas'],
  ]
  return (
    <>
      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">Tus respuestas</h2>
      <ul className="divide-y divide-borde overflow-hidden rounded-2xl bg-superficie">
        {filas.map(([paso, titulo, valor]) => (
          <li key={paso}>
            <Link to={`/evaluacion?paso=${pasos.indexOf(paso)}&editar=1`} className="flex min-h-12 items-center gap-3 px-4 py-2 active:bg-borde">
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-texto-suave">{titulo}</span>
                <span className="block leading-snug font-semibold">{valor}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-lima">Cambiar</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-texto-suave">Al cambiar una respuesta, el plan se vuelve a armar. Tu historial se mantiene.</p>
    </>
  )
}

/** Cómo se armó el plan (IA o reglas) y, si fue con reglas, un botón para intentar ajustarlo con IA. */
function OrigenPlan({ perfil, origen, motivo }: { perfil: Perfil; origen: Plan['origen']; motivo: Plan['motivoSinIa'] }) {
  const [ajustando, setAjustando] = useState(false)
  if (origen === 'ia')
    return (
      <p className="mt-3 rounded-2xl border border-lima/40 bg-lima/10 p-3 text-sm leading-snug">
        La IA (Gemini) eligió y ordenó tus ejercicios entre opciones que ya filtramos para ti: tu equipo, tu nivel y tus lesiones.
      </p>
    )
  return (
    <div className="mt-3 rounded-2xl bg-superficie p-3 text-sm leading-snug text-texto-suave">
      <p>{motivo ? MENSAJE_SIN_IA[motivo] : 'Plan armado con nuestras reglas de entrenamiento.'}</p>
      <button
        type="button"
        disabled={ajustando}
        onClick={async () => {
          setAjustando(true)
          await guardarEvaluacion(perfil)
          setAjustando(false)
        }}
        className="mt-2 h-11 rounded-xl border border-lima/60 px-4 font-semibold text-lima active:bg-lima/10 disabled:opacity-60"
      >
        {ajustando ? 'Ajustando…' : 'Ajustar con IA'}
      </button>
    </div>
  )
}
