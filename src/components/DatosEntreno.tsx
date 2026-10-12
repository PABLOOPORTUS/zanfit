import type { ResumenEntreno } from '../db/progreso'
import { useUnidad } from '../hooks/useAjustes'
import { formatearDuracion } from '../lib/formato'

/** Duración, volumen, series y récords nuevos de un entreno. Se usa en el resumen al finalizar y en el historial. */
export default function DatosEntreno({ resumen }: { resumen: ResumenEntreno }) {
  const u = useUnidad()
  return (
    <>
      <dl className="grid grid-cols-3 gap-2">
        <Dato titulo="Duración" valor={formatearDuracion(resumen.duracionMs)} />
        <Dato titulo="Volumen" valor={u.volumen(resumen.volumen)} />
        <Dato titulo="Series" valor={String(resumen.series)} />
      </dl>

      {resumen.records.length > 0 && (
        <div className="mt-4 rounded-2xl border border-lima/50 bg-lima/10 p-4">
          <p className="font-marca text-lg font-bold text-lima">
            {resumen.records.length === 1 ? '1 récord nuevo' : `${resumen.records.length} récords nuevos`}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {resumen.records.map((r) => (
              <li key={`${r.exerciseId}-${r.tipo}`}>
                <p className="font-semibold">{r.nombre}</p>
                <p className="text-sm text-texto-suave">
                  {r.tipo === 'peso' ? 'Peso máximo' : '1RM estimado'}: <span className="font-semibold text-texto">{u.peso(r.valor, 1)}</span>{' '}
                  (antes {u.peso(r.anterior, 1)})
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
    <div className="rounded-2xl border border-borde bg-superficie p-3">
      <dt className="text-xs text-texto-suave">{titulo}</dt>
      <dd className="mt-1 font-marca text-lg leading-tight font-bold">{valor}</dd>
    </div>
  )
}
