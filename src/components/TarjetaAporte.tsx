import { useState } from 'react'
import HojaAporte from './HojaAporte'
import { useAcceso } from '../hooks/useAcceso'

const CLAVE = 'zanfit:aporte-oculto-hasta'
const DIAS_OCULTA = 30

const oculta = () => {
  try {
    return Number(localStorage.getItem(CLAVE) ?? 0) > Date.now()
  } catch {
    return false
  }
}

/** Invitación amable a aportar (modo aporte voluntario), en Entrenar. La ✕ la oculta por 30 días. */
export default function TarjetaAporte({ className = '' }: { className?: string }) {
  const acceso = useAcceso()
  const [cerrada, setCerrada] = useState(oculta)
  const [abierta, setAbierta] = useState(false)
  if (!acceso?.voluntario || cerrada) return null
  return (
    <>
      <div className={`relative flex items-center gap-3 rounded-2xl bg-superficie p-3 pr-11 ${className}`}>
        <span className="text-2xl" aria-hidden>
          💚
        </span>
        <button type="button" onClick={() => setAbierta(true)} className="min-w-0 flex-1 text-left">
          <span className="block font-semibold">ZANFIT es gratis</span>
          <span className="block text-sm text-texto-suave">¿Te sirve? Apóyala con un aporte voluntario.</span>
        </button>
        <button
          type="button"
          onClick={() => setAbierta(true)}
          className="h-10 shrink-0 rounded-full bg-lima/10 px-4 text-sm font-semibold text-lima active:bg-lima/20"
        >
          Apoyar
        </button>
        <button
          type="button"
          onClick={() => {
            setCerrada(true)
            try {
              localStorage.setItem(CLAVE, String(Date.now() + DIAS_OCULTA * 86_400_000))
            } catch {
              // Sin localStorage vuelve a aparecer; no es grave.
            }
          }}
          aria-label="Ocultar por ahora"
          className="absolute top-0 right-0 flex size-11 items-center justify-center rounded-xl text-texto-suave active:bg-borde"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {abierta && <HojaAporte onCerrar={() => setAbierta(false)} />}
    </>
  )
}
