import { claveDia, inicioSemana, mejorRachaSemanal, rachaSemanal } from '../../lib/calculos'

const SEMANAS = 18
const DIAS = ['L', '', 'M', '', 'V', '', 'D']
const mes = new Intl.DateTimeFormat('es-CL', { month: 'short' })
const diaLargo = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })

/** Racha semanal + mapa de calor de los días entrenados en las últimas 18 semanas (semanas de lunes a domingo). */
export default function CalendarioEntrenos({ fechas }: { fechas: number[] }) {
  const hoy = new Date()
  const porDia = new Map<string, number>()
  for (const f of fechas) porDia.set(claveDia(f), (porDia.get(claveDia(f)) ?? 0) + 1)
  const estaSemana = fechas.filter((f) => inicioSemana(f).getTime() === inicioSemana(hoy).getTime()).length

  const inicio = inicioSemana(hoy)
  inicio.setDate(inicio.getDate() - (SEMANAS - 1) * 7)
  const semanas = Array.from({ length: SEMANAS }, (_, s) =>
    Array.from({ length: 7 }, (_, d) => {
      const dia = new Date(inicio)
      dia.setDate(inicio.getDate() + s * 7 + d)
      return dia
    }),
  )

  return (
    <div>
      <dl className="grid grid-cols-3 gap-2">
        <Dato titulo="Racha" valor={`${rachaSemanal(fechas)} sem`} destacado />
        <Dato titulo="Esta semana" valor={String(estaSemana)} />
        <Dato titulo="Mejor racha" valor={`${mejorRachaSemanal(fechas)} sem`} />
      </dl>

      <div className="mt-3 rounded-2xl border border-borde bg-superficie p-3">
        <div className="grid grid-cols-[1.25rem_1fr] gap-1">
          <div />
          <div className="grid text-[10px] text-texto-suave" style={{ gridTemplateColumns: `repeat(${SEMANAS}, 1fr)` }}>
            {semanas.map((dias, s) => (
              <span key={s} className="overflow-visible whitespace-nowrap">
                {(s === 0 || dias[0].getMonth() !== semanas[s - 1][0].getMonth()) && mes.format(dias[0]).replace('.', '')}
              </span>
            ))}
          </div>
          <div className="grid grid-rows-7 gap-[3px] text-[10px] leading-none text-texto-suave">
            {DIAS.map((d, i) => (
              <span key={i} className="flex items-center">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridTemplateColumns: `repeat(${SEMANAS}, 1fr)` }}>
            {semanas.flat().map((dia) => {
              const n = porDia.get(claveDia(dia)) ?? 0
              const futuro = dia > hoy
              const esHoy = claveDia(dia) === claveDia(hoy)
              const texto = `${diaLargo.format(dia)}: ${n === 0 ? 'sin entreno' : n === 1 ? '1 entreno' : `${n} entrenos`}`
              return (
                <span
                  key={dia.getTime()}
                  title={futuro ? undefined : texto}
                  aria-label={futuro ? undefined : texto}
                  className={`aspect-square rounded-[3px] ${futuro ? '' : n > 0 ? 'bg-lima' : 'bg-borde'} ${esHoy ? 'ring-2 ring-texto' : ''}`}
                />
              )
            })}
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-texto-suave">
          <span className="size-3 rounded-[3px] bg-borde" /> Sin entreno
          <span className="ml-2 size-3 rounded-[3px] bg-lima" /> Entrenaste
        </p>
      </div>
    </div>
  )
}

function Dato({ titulo, valor, destacado = false }: { titulo: string; valor: string; destacado?: boolean }) {
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-3">
      <dt className="text-xs text-texto-suave">{titulo}</dt>
      <dd className={`mt-1 font-marca text-xl font-bold ${destacado ? 'text-lima' : ''}`}>{valor}</dd>
    </div>
  )
}
