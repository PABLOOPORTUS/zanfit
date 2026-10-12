import { Link } from 'react-router-dom'

/** Botón principal flotante sobre la barra inferior (p. ej. "Crear"). La pantalla debe tener `pb-20`. */
export default function BotonFlotante({ to, children }: { to: string; children: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-10 mx-auto flex max-w-lg justify-end px-4">
      <Link
        to={to}
        className="pointer-events-auto flex h-16 items-center gap-2 rounded-full bg-lima pr-6 pl-5 text-lg font-bold text-fondo shadow-lg shadow-black/50 active:scale-95 active:bg-lima-oscuro"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        {children}
      </Link>
    </div>
  )
}
