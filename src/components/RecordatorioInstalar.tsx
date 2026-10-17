import { useState } from 'react'
import HojaInstalar from './HojaInstalar'
import { ofrecerInstalar } from '../lib/instalacion'

const CLAVE = 'zanfit:recordatorio-instalar'
const leerOculto = () => {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

/**
 * Después de entrenar (resumen), en un teléfono sin la app instalada: "¿Te gustó? Agrégala a tu pantalla de inicio",
 * con "Ver cómo" (abre `<HojaInstalar>`). Se puede ocultar para siempre.
 */
export default function RecordatorioInstalar() {
  const [oculto, setOculto] = useState(leerOculto)
  const [abierta, setAbierta] = useState(false)
  if (oculto || !ofrecerInstalar()) return null
  return (
    <div className="animate-entrar rounded-2xl border border-lima/50 bg-superficie p-4">
      <div className="flex items-center gap-3">
        <img src="/icon-192.png" alt="" className="size-12 shrink-0 rounded-xl" />
        <div>
          <p className="font-marca text-lg leading-tight font-bold">¿Te gustó? Agrégala a tu pantalla de inicio</p>
          <p className="text-sm text-texto-suave">Se abre como una app, a pantalla completa.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="mt-3 h-12 w-full rounded-xl bg-lima font-bold text-fondo active:bg-lima-oscuro"
      >
        Ver cómo (10 segundos)
      </button>
      <button
        type="button"
        onClick={() => {
          setOculto(true)
          try {
            localStorage.setItem(CLAVE, '1')
          } catch {
            // Sin localStorage vuelve a aparecer; no es grave.
          }
        }}
        className="mt-1 h-11 w-full text-sm text-texto-suave underline underline-offset-4"
      >
        No volver a mostrar
      </button>
      {abierta && <HojaInstalar onCerrar={() => setAbierta(false)} />}
    </div>
  )
}
