import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PuntoProgreso } from '../db/progreso'
import { useUnidad } from '../hooks/useAjustes'
import { formatearFecha } from '../lib/formato'

type Props = {
  datos: PuntoProgreso[]
  campo: 'pesoMaximo' | 'volumen'
  /** Línea para el peso (eje desde un valor cercano al mínimo); barras para el volumen (eje desde 0). */
  tipo: 'linea' | 'barras'
}

// Recharts recibe colores como atributos SVG: se usan las variables del tema, nunca hex sueltos.
const LIMA = 'var(--color-lima)'
const BORDE = 'var(--color-borde)'
const TEXTO_SUAVE = 'var(--color-texto-suave)'
const compacto = new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 })
const eje = { stroke: BORDE, tick: { fill: TEXTO_SUAVE, fontSize: 12 }, tickLine: false, axisLine: false } as const

/** Un gráfico de una sola serie (sin leyenda: el título de la sección la nombra) con tooltip al tocar. */
export default function GraficoProgreso({ datos, campo, tipo }: Props) {
  const u = useUnidad()
  // Los datos vienen en kg; el eje y el tooltip se muestran en la unidad elegida.
  const convertidos = datos.map((p) => ({ ...p, [campo]: u.aUnidad(p[campo]) }))
  const formato = (v: number) => (campo === 'volumen' ? u.volumen(u.aKg(v)) : u.peso(u.aKg(v)))
  const comun = { data: convertidos, margin: { top: 8, right: 8, bottom: 0, left: 0 } }
  const x = <XAxis dataKey="fecha" tickFormatter={(f: number) => formatearFecha(f)} minTickGap={24} {...eje} />
  const y = <YAxis width={44} tickFormatter={(v: number) => compacto.format(v)} domain={tipo === 'linea' ? ['auto', 'auto'] : [0, 'auto']} {...eje} />
  const grilla = <CartesianGrid vertical={false} stroke={BORDE} strokeDasharray="3 3" />
  const tooltip = <Tooltip content={(p) => <Globo active={p.active} payload={p.payload} formato={formato} />} cursor={tipo === 'linea' ? { stroke: TEXTO_SUAVE } : { fill: BORDE, opacity: 0.5 }} />

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {tipo === 'linea' ? (
          <LineChart {...comun}>
            {grilla}
            {x}
            {y}
            {tooltip}
            <Line dataKey={campo} stroke={LIMA} strokeWidth={2} dot={{ r: 4, fill: LIMA, strokeWidth: 0 }} activeDot={{ r: 6, fill: LIMA, stroke: 'var(--color-fondo)', strokeWidth: 2 }} isAnimationActive={false} />
          </LineChart>
        ) : (
          <BarChart {...comun}>
            {grilla}
            {x}
            {y}
            {tooltip}
            <Bar dataKey={campo} fill={LIMA} radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

type PropsGlobo = { active?: boolean; payload?: readonly { value?: unknown; payload?: unknown }[]; formato: (v: number) => string }

function Globo({ active, payload, formato }: PropsGlobo) {
  const punto = payload?.[0]
  if (!active || !punto) return null
  return (
    <div className="rounded-xl border border-borde bg-fondo px-3 py-2 shadow-lg">
      <p className="text-xs text-texto-suave">{formatearFecha((punto.payload as PuntoProgreso).fecha)}</p>
      <p className="font-marca text-lg font-semibold">{formato(Number(punto.value))}</p>
    </div>
  )
}
