import type { ResumenEntreno } from '../db/progreso'
import { useUnidad } from '../hooks/useAjustes'
import { usePerfil } from '../hooks/usePlan'
import { caloriasDeResumen } from '../lib/calorias'
import { esCardio } from '../lib/cardio'
import { formatearDuracion } from '../lib/formato'

/** Duración, volumen (o minutos de cardio), series, calorías y récords nuevos de un entreno. Se usa en el resumen al finalizar y en el historial. */
export default function DatosEntreno({ resumen }: { resumen: ResumenEntreno }) {
  const u = useUnidad()
  const perfil = usePerfil()
  const minutosCardio = resumen.bloques.filter((b) => esCardio(b.exercise)).reduce((t, b) => t + b.sets.reduce((m, s) => m + (s.minutos ?? 0), 0), 0)
  const soloCardio = minutosCardio > 0 && resumen.volumen === 0
  return (
    <>
      <dl className="grid grid-cols-2 gap-2">
        <Dato titulo="Duración" valor={formatearDuracion(resumen.duracionMs)} />
        {/* En un día de solo cardio, el volumen (kilos) no dice nada: va el tiempo de cardio. */}
        {soloCardio ? <Dato titulo="Cardio" valor={`${minutosCardio} min`} /> : <Dato titulo="Volumen" valor={u.volumen(resumen.volumen)} />}
        {soloCardio || minutosCardio === 0 ? (
          <Dato titulo={soloCardio ? 'Tramos' : 'Series'} valor={String(resumen.series)} />
        ) : (
          <Dato titulo="Series · cardio" valor={`${resumen.series} · ${minutosCardio} min`} />
        )}
        <Dato
          titulo={perfil?.pesoKg ? 'Calorías (aprox.)' : 'Calorías (aprox., 70 kg)'}
          valor={`~${caloriasDeResumen(resumen, perfil?.pesoKg)} kcal`}
        />
      </dl>

      {resumen.records.length > 0 && (
        <div className="mt-4 rounded-2xl border border-lima/50 bg-lima/10 p-4">
          <p className="font-marca text-lg font-semibold text-lima">
            {resumen.records.length === 1 ? '1 récord nuevo' : `${resumen.records.length} récords nuevos`}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {resumen.records.map((r) => (
              <li key={`${r.exerciseId}-${r.tipo}`}>
                <p className="font-semibold">{r.nombre}</p>
                <p className="text-sm text-texto-suave">
                  {r.tipo === 'peso' ? 'Peso máximo' : '1RM estimado'}: <span className="font-semibold text-texto">{u.peso(r.valor, 1)}</span> (antes{' '}
                  {u.peso(r.anterior, 1)})
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-superficie p-3">
      <dt className="text-xs text-texto-suave">{titulo}</dt>
      <dd className="mt-1 font-marca text-lg leading-tight font-semibold">{valor}</dd>
    </div>
  )
}
