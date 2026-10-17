import { Link } from 'react-router-dom'

export default function BotonVolver({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="-ml-3 inline-flex h-12 items-center gap-1 rounded-xl px-3 font-semibold text-texto-suave active:bg-superficie"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 6-6 6 6 6" />
      </svg>
      {children}
    </Link>
  )
}
