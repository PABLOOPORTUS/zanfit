import { Link, useParams } from 'react-router-dom'
import BotonCompartir from '../../components/BotonCompartir'
import Confeti from '../../components/Confeti'
import DatosEntreno from '../../components/DatosEntreno'
import Medalla from '../../components/Medalla'
import RecordatorioInstalar from '../../components/RecordatorioInstalar'
import NotasEntreno from '../../components/NotasEntreno'
import { useUnidad } from '../../hooks/useAjustes'
import { useContador } from '../../hooks/useContador'
import { useJuego, useLogros } from '../../hooks/useLogros'
import { usePerfil } from '../../hooks/usePlan'
import { useResumenEntreno } from '../../hooks/useWorkouts'
import { caloriasDeResumen } from '../../lib/calorias'
import { formatearDuracion, formatearFechaLarga } from '../../lib/formato'
import { nivelPara } from '../../lib/juego'
import { equivalencia } from '../../lib/logros'

/** `/entrenar/resumen/:id`: se muestra al finalizar un entreno, con confeti, puntos, calorías y logros. */
export default function ResumenEntreno() {
  const id = Number(useParams().id)
  const resumen = useResumenEntreno(id)
  const logros = useLogros()
  const juego = useJuego()
  const perfil = usePerfil()
  const u = useUnidad()
  const detalle = juego?.porEntreno.get(id)
  const puntosAnimados = useContador(detalle?.total ?? 0, 1400, 500)
  const kcal = resumen ? caloriasDeResumen(resumen, perfil?.pesoKg) : 0
  const kcalAnimadas = useContador(kcal, 1400, 700)

  if (resumen === undefined || logros === undefined || juego === undefined || perfil === undefined) return null
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
  // Puntos acumulados hasta este entreno (inclusive), para saber si con él subió de nivel.
  let acumulado = 0
  for (const [wid, d] of juego.porEntreno) {
    acumulado += d.total
    if (wid === id) break
  }
  const antes = nivelPara(acumulado - (detalle?.total ?? 0))
  const ahora = nivelPara(acumulado)
  const subio = ahora.numero > antes.numero
  const partes = detalle
    ? [
        ['Entreno terminado', detalle.terminar],
        ['Series', detalle.series],
        ['Día del plan', detalle.plan],
        ['Día cumplido', detalle.cumplido],
        ['Récords', detalle.records],
      ].filter(([, n]) => Number(n) > 0)
    : []

  return (
    <section>
      <Confeti cantidad={subio ? 110 : 60} />

      <p className="animate-entrar font-semibold text-lima">Entreno terminado</p>
      <h1 className="animate-entrar font-marca text-4xl font-bold tracking-tight [animation-delay:80ms]">¡Buen trabajo!</h1>
      <p className="mt-1 animate-entrar text-texto-suave [animation-delay:120ms]">
        {resumen.workout.nombre} · {formatearFechaLarga(resumen.workout.fechaInicio)}
      </p>

      {subio && (
        <div className="mt-5 animate-aparecer rounded-2xl border-2 border-lima bg-lima/10 p-5 text-center">
          <img src={`/medios/animales/${ahora.archivo}.webp`} alt="" className="mx-auto size-32 animate-flotar" />
          <p className="mt-2 text-sm font-bold tracking-wide text-lima uppercase">¡Subiste de nivel!</p>
          <p className="font-marca text-3xl font-bold">
            Nivel {ahora.numero}: {ahora.animal}
          </p>
          <p className="mt-1 text-texto-suave">{ahora.frase}</p>
        </div>
      )}

      <div className="mt-5 grid animate-entrar grid-cols-2 gap-2 [animation-delay:200ms]">
        <div className="rounded-2xl border border-lima/50 bg-lima/10 p-4 text-center">
          <p className="font-marca text-4xl font-bold text-lima tabular-nums">+{puntosAnimados}</p>
          <p className="text-sm text-texto-suave">puntos</p>
        </div>
        <div className="rounded-2xl border border-borde bg-superficie p-4 text-center">
          <p className="font-marca text-4xl font-bold tabular-nums">~{kcalAnimadas}</p>
          <p className="text-sm text-texto-suave">kcal (aprox.)</p>
        </div>
      </div>
      {partes.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {partes.map(([nombre, n], i) => (
            <li
              key={nombre}
              className="animate-entrar rounded-full border border-borde px-3 py-1 text-sm"
              style={{ animationDelay: `${600 + i * 90}ms` }}
            >
              {nombre} <span className="font-semibold text-lima">+{n}</span>
            </li>
          ))}
        </ul>
      )}

      {cosa && (
        <p className="mt-4 animate-entrar rounded-2xl border border-borde bg-superficie p-4 text-lg leading-snug [animation-delay:300ms]">
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
              <li key={l.id} className="flex animate-aparecer items-center gap-3" style={{ animationDelay: `${800 + i * 150}ms` }}>
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
        <BotonCompartir
          texto={subio ? `¡Subí a nivel ${ahora.numero}: ${ahora.animal} en ZANFIT! 💪` : `¡Entreno terminado en ZANFIT! 💪`}
          datos={{
            etiqueta: subio ? '¡Subí de nivel!' : 'Entreno terminado',
            titulo: subio ? `Nivel ${ahora.numero}: ${ahora.animal}` : resumen.workout.nombre.replace(/^Plan · /, ''),
            subtitulo: formatearFechaLarga(resumen.workout.fechaInicio),
            animal: ahora.archivo,
            nivel: subio ? '' : `Nivel ${ahora.numero} · ${ahora.animal}`,
            datos: [
              { valor: formatearDuracion(resumen.duracionMs), etiqueta: 'duración' },
              { valor: u.volumen(resumen.volumen), etiqueta: 'levantados' },
              { valor: `~${kcal}`, etiqueta: 'kcal' },
              nuevos.length > 0
                ? { valor: String(nuevos.length), etiqueta: nuevos.length === 1 ? 'logro nuevo' : 'logros nuevos' }
                : { valor: String(resumen.series), etiqueta: 'series' },
            ],
          }}
        />
      </div>

      <div className="mt-6">
        <RecordatorioInstalar />
      </div>

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
