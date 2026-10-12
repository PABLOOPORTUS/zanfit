import type { Categoria } from '../lib/logros'

const ICONOS: Record<Categoria, string> = {
  entrenos: 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12',
  racha: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1.5 1 3 2.5 3 5 1-1 1-3 0-8z',
  records: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3',
  volumen: 'M3 10h2v4H3zM19 10h2v4h-2zM5 8h3v8H5zM16 8h3v8h-3zM8 12h8',
  plan: 'M4 5h16v15H4zM4 9h16M9 3v4M15 3v4M8 14l2.5 2.5L16 12',
  cumplidos: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6',
}

/** Medalla redonda: lima si está ganada, gris si no. */
export default function Medalla({ categoria, ganada, className = 'size-14' }: { categoria: Categoria; ganada: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full border-2 ${className} ${
        ganada ? 'border-lima bg-lima text-fondo shadow-lg shadow-lima/30' : 'border-borde bg-superficie text-texto-suave'
      }`}
    >
      <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICONOS[categoria]} />
      </svg>
    </span>
  )
}
