import { Link, useParams } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import GraficoProgreso from '../../components/GraficoProgreso'
import { useExercise } from '../../hooks/useExercises'
import { useProgresoEjercicio } from '../../hooks/useWorkouts'
import { useUnidad } from '../../hooks/useAjustes'
import { formatearFecha } from '../../lib/formato'

/** `/progreso/ejercicios/:id`: récords y evolución de un ejercicio. */
export default function ProgresoEjercicio() {
  const id = Number(useParams().id)
  const ejercicio = useExercise(id)
  const puntos = useProgresoEjercicio(id)
  const u = useUnidad()

  if (ejercicio === undefined || puntos === undefined) return null
  if (ejercicio === null) {
    return (
      <section>
        <BotonVolver to="/progreso?vista=records">Récords</BotonVolver>
        <p className="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">No encontramos este ejercicio.</p>
      </section>
    )
  }

  const mejorPeso = puntos.reduce((a, p) => Math.max(a, p.pesoMaximo), 0)
  const mejor1RM = puntos.reduce((a, p) => Math.max(a, p.mejor1RM), 0)

  return (
    <section>
      <BotonVolver to="/progreso?vista=records">Récords</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl leading-tight font-semibold tracking-tight">{ejercicio.nombre}</h1>
      <Link to={`/ejercicios/${id}`} className="mt-1 inline-flex h-12 items-center font-semibold text-lima">
        Ver cómo se hace
      </Link>

      {puntos.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
          Todavía no completas series de este ejercicio.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-3 gap-2">
            <Dato titulo="Peso máximo" valor={u.peso(mejorPeso)} />
            <Dato titulo="1RM estimado" valor={u.peso(mejor1RM, 1)} />
            <Dato titulo="Sesiones" valor={String(puntos.length)} />
          </dl>

          <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">Peso máximo por sesión</h2>
          <div className="rounded-2xl bg-superficie p-3">
            <GraficoProgreso datos={puntos} campo="pesoMaximo" tipo="linea" />
          </div>

          <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">Volumen por sesión</h2>
          <div className="rounded-2xl bg-superficie p-3">
            <GraficoProgreso datos={puntos} campo="volumen" tipo="barras" />
          </div>

          <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">Sesiones</h2>
          <div className="overflow-x-auto rounded-2xl bg-superficie">
            <table className="w-full text-left text-sm whitespace-nowrap tabular-nums">
              <thead className="text-xs text-texto-suave">
                <tr>
                  <th className="px-4 py-2 font-semibold">Fecha</th>
                  <th className="px-2 py-2 text-right font-semibold">Máximo</th>
                  <th className="px-2 py-2 text-right font-semibold">1RM</th>
                  <th className="px-4 py-2 text-right font-semibold">Volumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {[...puntos].reverse().map((p) => (
                  <tr key={p.workoutId}>
                    <td className="p-0">
                      <Link
                        to={`/progreso/entrenos/${p.workoutId}`}
                        className="flex min-h-12 items-center px-4 font-semibold text-lima underline decoration-lima/40 underline-offset-4 active:bg-borde"
                      >
                        {formatearFecha(p.fecha)}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-right">{u.peso(p.pesoMaximo)}</td>
                    <td className="px-2 py-3 text-right">{u.peso(p.mejor1RM, 1)}</td>
                    <td className="px-4 py-3 text-right">{u.volumen(p.volumen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-superficie p-3">
      <dt className="text-xs text-texto-suave">{titulo}</dt>
      <dd className="mt-1 font-marca text-lg font-semibold">{valor}</dd>
    </div>
  )
}
