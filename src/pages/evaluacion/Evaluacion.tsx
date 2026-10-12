import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import OpcionGrande from '../../components/OpcionGrande'
import SelectorOpciones from '../../components/SelectorOpciones'
import { guardarEvaluacion } from '../../db/plan'
import { useUnidad } from '../../hooks/useAjustes'
import { usePerfil } from '../../hooks/usePlan'
import { EXPERIENCIAS, LESIONES, LUGARES, OBJETIVOS, preguntasSalud, SEXOS, ZONAS } from '../../lib/evaluacion'
import { leerNumero } from '../../lib/formato'
import { edad as calcularEdad } from '../../lib/plan'
import type { Experiencia, Lesion, Lugar, Objetivo, Perfil, Sexo, Zona } from '../../types'

const PASOS = ['inicio', 'sexo', 'datos', 'objetivo', 'zonas', 'experiencia', 'lugar', 'frecuencia', 'lesiones', 'salud'] as const
type Paso = (typeof PASOS)[number]

interface Borrador {
  sexo: Sexo | null
  edad: string
  peso: string
  altura: string
  objetivo: Objetivo | null
  zonas: Zona[]
  experiencia: Experiencia | null
  lugar: Lugar | null
  dias: number
  minutos: number
  lesiones: Lesion[]
  /** `null` = sin responder. */
  salud: (boolean | null)[]
}

/** `/evaluacion?paso=N`: una pregunta por pantalla. Cada paso es una entrada del historial, así el botón atrás funciona. */
export default function Evaluacion() {
  const perfil = usePerfil()
  if (perfil === undefined) return null
  return <Cuestionario key={perfil?.actualizadoEn ?? 0} anterior={perfil} />
}

function Cuestionario({ anterior }: { anterior: Perfil | null }) {
  const navigate = useNavigate()
  const u = useUnidad()
  const [params] = useSearchParams()
  const [guardando, setGuardando] = useState(false)
  const [b, setB] = useState<Borrador>(() => ({
    sexo: anterior?.sexo ?? null,
    edad: anterior ? String(calcularEdad(anterior)) : '',
    peso: anterior ? String(Math.round(u.aUnidad(anterior.pesoKg) * 10) / 10).replace('.', ',') : '',
    altura: anterior ? String(anterior.alturaCm) : '',
    objetivo: anterior?.objetivo ?? null,
    zonas: anterior?.zonas ?? [],
    experiencia: anterior?.experiencia ?? null,
    lugar: anterior?.lugar ?? 'gimnasio',
    dias: anterior?.diasPorSemana ?? 3,
    minutos: anterior?.minutosPorSesion ?? 60,
    lesiones: anterior?.lesiones ?? [],
    salud: preguntasSalud(anterior?.sexo ?? null).map(() => null),
  }))
  const cambiar = (cambios: Partial<Borrador>) => setB((x) => ({ ...x, ...cambios }))

  const edad = Number(b.edad)
  const pesoKg = u.aKg(leerNumero(b.peso))
  const altura = Number(b.altura)
  const errores = {
    edad: b.edad && (edad < 14 || edad > 90) ? 'Ingresa una edad entre 14 y 90 años.' : null,
    peso: b.peso && (pesoKg < 30 || pesoKg > 250) ? `Revisa el peso (en ${u.unidad}).` : null,
    altura: b.altura && (altura < 120 || altura > 220) ? 'Ingresa tu altura en centímetros, entre 120 y 220.' : null,
  }
  const valido: Record<Paso, boolean> = {
    inicio: true,
    sexo: b.sexo !== null,
    datos: Boolean(b.edad && b.peso && b.altura) && !errores.edad && !errores.peso && !errores.altura,
    objetivo: b.objetivo !== null,
    zonas: b.zonas.length > 0,
    experiencia: b.experiencia !== null,
    lugar: b.lugar !== null,
    frecuencia: true,
    lesiones: true,
    salud: b.salud.every((r) => r !== null),
  }

  const indice = Math.min(Math.max(Number(params.get('paso')) || 0, 0), PASOS.length - 1)
  // Si se entra directo a un paso (o se recarga la página), volver al primero que falte responder.
  const pendiente = PASOS.slice(0, indice).findIndex((p) => !valido[p])
  if (pendiente >= 0) return <Navigate to={`/evaluacion?paso=${pendiente}`} replace />
  const paso = PASOS[indice]
  const esUltimo = indice === PASOS.length - 1

  async function siguiente() {
    if (!esUltimo) return navigate(`/evaluacion?paso=${indice + 1}`)
    setGuardando(true)
    await guardarEvaluacion({
      sexo: b.sexo!,
      anioNacimiento: new Date().getFullYear() - edad,
      pesoKg,
      alturaCm: altura,
      objetivo: b.objetivo!,
      zonas: b.zonas,
      experiencia: b.experiencia!,
      lugar: b.lugar!,
      diasPorSemana: b.dias,
      minutosPorSesion: b.minutos,
      lesiones: b.lesiones,
      precaucion: b.salud.some(Boolean),
    })
    navigate('/plan', { replace: true })
  }

  const alternar = <T,>(lista: T[], valor: T) => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor])

  return (
    <section className="flex min-h-[calc(100dvh-12rem)] flex-col">
      <div className="flex items-center gap-3">
        {indice > 0 && (
          <button type="button" onClick={() => navigate(-1)} aria-label="Pregunta anterior" className="-ml-3 flex size-12 items-center justify-center rounded-xl text-texto-suave active:bg-superficie">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
        )}
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-borde" role="progressbar" aria-valuenow={indice + 1} aria-valuemin={1} aria-valuemax={PASOS.length}>
          <div className="h-full rounded-full bg-lima transition-[width]" style={{ width: `${((indice + 1) / PASOS.length) * 100}%` }} />
        </div>
        <span className="text-sm text-texto-suave tabular-nums">
          {indice + 1}/{PASOS.length}
        </span>
      </div>

      <div className="mt-6 flex-1">
        {paso === 'inicio' && (
          <Pregunta titulo="Armemos tu plan" detalle="Responde 9 preguntas rápidas y te armamos un plan de entrenamiento a tu medida. Tus respuestas se guardan solo en este teléfono.">
            <ul className="flex flex-col gap-3 text-texto-suave">
              <li>• Cuánto pesas, cuánto mides y tu edad</li>
              <li>• Qué quieres lograr y qué zonas quieres mejorar</li>
              <li>• Tu experiencia, cuántos días puedes entrenar y si tienes lesiones</li>
            </ul>
          </Pregunta>
        )}

        {paso === 'sexo' && (
          <Pregunta titulo="¿Eres hombre o mujer?" detalle="Lo usamos para calcular los pesos de partida: las referencias de fuerza son distintas.">
            {SEXOS.map((s) => (
              <OpcionGrande
                key={s.valor}
                titulo={s.etiqueta}
                activo={b.sexo === s.valor}
                onClick={() => cambiar({ sexo: s.valor, salud: preguntasSalud(s.valor).map((_, i) => b.salud[i] ?? null) })}
              />
            ))}
          </Pregunta>
        )}

        {paso === 'datos' && (
          <Pregunta titulo="Tus datos" detalle="Con tu peso y tu altura calculamos tu IMC y los pesos de partida.">
            <Campo etiqueta="Edad" sufijo="años" valor={b.edad} onChange={(v) => cambiar({ edad: v.replace(/\D/g, '') })} error={errores.edad} modo="numeric" />
            <Campo etiqueta="Peso" sufijo={u.unidad} valor={b.peso} onChange={(v) => cambiar({ peso: v.replace(/[^\d.,]/g, '') })} error={errores.peso} modo="decimal" />
            <Campo etiqueta="Altura" sufijo="cm" valor={b.altura} onChange={(v) => cambiar({ altura: v.replace(/\D/g, '') })} error={errores.altura} modo="numeric" />
          </Pregunta>
        )}

        {paso === 'objetivo' && (
          <Pregunta titulo="¿Qué quieres lograr?" detalle="Elige tu objetivo principal.">
            {OBJETIVOS.map((o) => (
              <OpcionGrande key={o.valor} titulo={o.etiqueta} detalle={o.detalle} activo={b.objetivo === o.valor} onClick={() => cambiar({ objetivo: o.valor })} />
            ))}
          </Pregunta>
        )}

        {paso === 'zonas' && (
          <Pregunta titulo="¿Qué quieres mejorar?" detalle="Puedes elegir varias. Le daremos más trabajo a esas zonas.">
            {ZONAS.map((z) => (
              <OpcionGrande
                key={z.valor}
                multiple
                titulo={z.etiqueta}
                activo={b.zonas.includes(z.valor)}
                onClick={() =>
                  cambiar({
                    zonas:
                      z.valor === 'general'
                        ? b.zonas.includes('general') ? [] : ['general']
                        : alternar(b.zonas.filter((x) => x !== 'general'), z.valor),
                  })
                }
              />
            ))}
          </Pregunta>
        )}

        {paso === 'experiencia' && (
          <Pregunta titulo="¿Cuánta experiencia tienes?" detalle="Si recién partes, el plan usa más máquinas, que son más fáciles y seguras para aprender.">
            {EXPERIENCIAS.map((e) => (
              <OpcionGrande key={e.valor} titulo={e.etiqueta} detalle={e.detalle} activo={b.experiencia === e.valor} onClick={() => cambiar({ experiencia: e.valor })} />
            ))}
          </Pregunta>
        )}

        {paso === 'lugar' && (
          <Pregunta titulo="¿Dónde vas a entrenar?">
            {LUGARES.map((l) => (
              <OpcionGrande key={l.valor} titulo={l.etiqueta} detalle={l.detalle} activo={b.lugar === l.valor} onClick={() => cambiar({ lugar: l.valor })} />
            ))}
          </Pregunta>
        )}

        {paso === 'frecuencia' && (
          <Pregunta titulo="¿Cuánto tiempo tienes?">
            <SelectorOpciones
              leyenda="Días por semana"
              opciones={[2, 3, 4, 5, 6].map((d) => ({ valor: String(d), etiqueta: `${d} días` }))}
              valor={String(b.dias)}
              onChange={(v) => cambiar({ dias: Number(v) })}
            />
            <SelectorOpciones
              leyenda="Minutos por sesión"
              opciones={[30, 45, 60, 75, 90].map((m) => ({ valor: String(m), etiqueta: `${m} min` }))}
              valor={String(b.minutos)}
              onChange={(v) => cambiar({ minutos: Number(v) })}
            />
          </Pregunta>
        )}

        {paso === 'lesiones' && (
          <Pregunta titulo="¿Tienes alguna lesión o molestia?" detalle="Evitaremos los ejercicios que exigen esas zonas.">
            <OpcionGrande titulo="Ninguna" activo={b.lesiones.length === 0} onClick={() => cambiar({ lesiones: [] })} />
            {LESIONES.map((l) => (
              <OpcionGrande key={l.valor} multiple titulo={l.etiqueta} activo={b.lesiones.includes(l.valor)} onClick={() => cambiar({ lesiones: alternar(b.lesiones, l.valor) })} />
            ))}
          </Pregunta>
        )}

        {paso === 'salud' && (
          <Pregunta titulo="Antes de partir" detalle="Unas preguntas de salud. Si respondes que sí a alguna, te recomendaremos consultar a un médico y el plan partirá más suave.">
            {preguntasSalud(b.sexo).map((texto, i) => (
              <div key={texto} className="rounded-2xl border border-borde bg-superficie p-4">
                <p className="leading-snug">{texto}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[false, true].map((si) => (
                    <button
                      key={String(si)}
                      type="button"
                      aria-pressed={b.salud[i] === si}
                      onClick={() => cambiar({ salud: b.salud.map((r, j) => (j === i ? si : r)) })}
                      className={`h-12 rounded-xl border font-semibold ${b.salud[i] === si ? 'border-lima bg-lima text-fondo' : 'border-borde active:bg-borde'}`}
                    >
                      {si ? 'Sí' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Pregunta>
        )}
      </div>

      <button
        type="button"
        onClick={siguiente}
        disabled={!valido[paso] || guardando}
        className="mt-8 h-16 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro disabled:bg-borde disabled:text-texto-suave"
      >
        {paso === 'inicio' ? 'Empezar' : esUltimo ? 'Crear mi plan' : 'Siguiente'}
      </button>
    </section>
  )
}

function Pregunta({ titulo, detalle, children }: { titulo: string; detalle?: string; children: ReactNode }) {
  return (
    <div>
      <h1 className="font-marca text-3xl leading-tight font-bold tracking-tight">{titulo}</h1>
      {detalle && <p className="mt-2 text-texto-suave">{detalle}</p>}
      <div className="mt-6 flex flex-col gap-3">{children}</div>
    </div>
  )
}

type PropsCampo = { etiqueta: string; sufijo: string; valor: string; onChange: (v: string) => void; error: string | null; modo: 'numeric' | 'decimal' }

function Campo({ etiqueta, sufijo, valor, onChange, error, modo }: PropsCampo) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-semibold">{etiqueta}</span>
      <span className="relative">
        <input
          type="text"
          inputMode={modo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={`h-14 w-full rounded-2xl border bg-superficie pr-16 pl-4 font-marca text-xl font-bold focus:outline-none ${error ? 'border-peligro' : 'border-borde focus:border-lima'}`}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-texto-suave">{sufijo}</span>
      </span>
      {error && (
        <span className="text-sm text-peligro" role="alert">
          {error}
        </span>
      )}
    </label>
  )
}
