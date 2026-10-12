import { useMemo, type CSSProperties } from 'react'

const COLORES = ['bg-lima', 'bg-texto', 'bg-lima-oscuro', 'bg-peligro', 'bg-amarillo']

/** Lluvia de confeti a pantalla completa (solo CSS; no se muestra con "reducir movimiento"). No bloquea los toques. */
export default function Confeti({ cantidad = 60 }: { cantidad?: number }) {
  const piezas = useMemo(
    () =>
      Array.from({ length: cantidad }, (_, i) => ({
        izquierda: Math.random() * 100,
        ancho: 6 + Math.random() * 6,
        alto: 8 + Math.random() * 10,
        color: COLORES[i % COLORES.length],
        estilo: {
          '--retraso': `${Math.random() * 0.8}s`,
          '--duracion': `${2.2 + Math.random() * 1.6}s`,
          '--deriva': `${(Math.random() - 0.5) * 160}px`,
          '--giro': `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540)}deg`,
        },
        redondo: Math.random() > 0.7,
      })),
    [cantidad],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {piezas.map((p, i) => (
        <span
          key={i}
          className={`absolute top-0 block animate-caer ${p.color} ${p.redondo ? 'rounded-full' : 'rounded-sm'}`}
          style={{ left: `${p.izquierda}%`, width: p.ancho, height: p.redondo ? p.ancho : p.alto, ...(p.estilo as CSSProperties) }}
        />
      ))}
    </div>
  )
}
