import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useEntrenoActivo } from '../hooks/useWorkouts'

type Tab = { to: string; label: string; icon: ReactNode }

const iconProps = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const tabs: Tab[] = [
  {
    to: '/entrenar',
    label: 'Entrenar',
    icon: (
      <svg {...iconProps}>
        <path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" />
      </svg>
    ),
  },
  {
    to: '/rutinas',
    label: 'Rutinas',
    icon: (
      <svg {...iconProps}>
        <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
      </svg>
    ),
  },
  {
    to: '/progreso',
    label: 'Progreso',
    icon: (
      <svg {...iconProps}>
        <path d="M3 20h18M5 16l4-5 4 3 6-8" />
      </svg>
    ),
  },
  {
    to: '/ejercicios',
    label: 'Ejercicios',
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const enCurso = Boolean(useEntrenoActivo())
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-superficie">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `group flex h-18 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors active:scale-95 ${
                  isActive ? 'text-lima' : 'text-texto-suave'
                }`
              }
            >
              <span className="relative group-aria-[current=page]:animate-pop">
                {tab.icon}
                {tab.to === '/entrenar' && enCurso && (
                  <span className="absolute -top-0.5 -right-1.5 size-2.5 rounded-full bg-lima ring-2 ring-superficie" aria-label="Entreno en curso" />
                )}
              </span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
