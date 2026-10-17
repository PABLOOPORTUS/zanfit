import { Link } from 'react-router-dom'
import BotonFlotante from '../../components/BotonFlotante'
import { useExercises } from '../../hooks/useExercises'
import { usePlan } from '../../hooks/usePlan'
import { useRoutines } from '../../hooks/useRoutines'

export default function ListaRutinas() {
  const rutinas = useRoutines()
  const ejercicios = useExercises()
  const datosPlan = usePlan()
  if (rutinas === undefined || ejercicios === undefined || datosPlan === undefined) return null
  const delPlan = new Set(datosPlan?.plan.rutinaIds)
  const nombres = new Map(ejercicios.map((e) => [e.id!, e.nombre]))

  return (
    <section className="pb-20">
      <h1 className="font-marca text-3xl font-semibold tracking-tight">Rutinas</h1>

      {rutinas.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
          Todavía no tienes rutinas. Crea la primera con el botón de abajo.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rutinas.map((r) => {
            const series = r.ejercicios.reduce((total, e) => total + e.seriesObjetivo, 0)
            return (
              <li key={r.id}>
                <Link to={`/rutinas/${r.id}`} className="block rounded-2xl bg-superficie p-4 active:bg-borde">
                  {delPlan.has(r.id!) && <p className="text-xs font-semibold tracking-wide text-lima uppercase">Tu plan</p>}
                  <p className="font-marca text-lg leading-tight font-semibold break-words">{r.nombre}</p>
                  <p className="mt-0.5 text-sm text-texto-suave">
                    {r.ejercicios.length} {r.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'} · {series} series
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-texto-suave">
                    {r.ejercicios.map((e) => nombres.get(e.exerciseId) ?? 'Ejercicio eliminado').join(' · ')}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <BotonFlotante to="/rutinas/nueva">Crear</BotonFlotante>
    </section>
  )
}
