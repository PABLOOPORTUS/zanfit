import { Link } from 'react-router-dom'
import { useMetaSemanal } from '../hooks/useLogros'
import { mensajeSemana } from '../lib/logros'

/** Meta de entrenos de la semana (de la evaluación) con un mensaje que cambia según el avance, y la racha. */
export default function MetaSemanal() {
  const datos = useMetaSemanal()
  if (!datos) return null
  const { hechos, meta, racha, diaSemana, kcal } = datos
  const cumplida = hechos >= meta
  return (
    <div className={`rounded-2xl p-4 ${cumplida ? 'bg-lima/10 ring-1 ring-lima/60' : 'bg-superficie'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wider text-texto-suave uppercase">Esta semana</p>
          <p className="font-marca text-2xl leading-tight font-bold">
            {hechos} <span className="text-base font-semibold text-texto-suave">de {meta} entrenos</span>
          </p>
        </div>
        {racha > 0 && (
          <Link
            to="/progreso?vista=logros"
            className="flex shrink-0 flex-col items-center rounded-xl bg-fondo px-2 py-1.5 active:bg-borde"
          >
            <span className="flex items-center gap-0.5">
              <img src="/medios/animales/fuego.webp" alt="" className="size-6" />
              <span className="font-marca text-lg leading-none font-bold text-lima">{racha}</span>
            </span>
            <span className="text-[11px] leading-tight text-texto-suave">{racha === 1 ? 'semana' : 'semanas'} de racha</span>
          </Link>
        )}
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {Array.from({ length: Math.max(meta, hechos) }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < hechos ? 'animate-pop bg-lima' : 'bg-borde'}`}
            style={{ animationDelay: `${400 + i * 120}ms` }}
          />
        ))}
      </div>
      <p className="mt-3 text-sm leading-snug">{mensajeSemana(hechos, meta, diaSemana)}</p>
      {kcal > 0 && <p className="mt-1 text-sm text-texto-suave">Quemaste ~{kcal.toLocaleString('es-CL')} kcal esta semana (aprox.).</p>}
    </div>
  )
}
