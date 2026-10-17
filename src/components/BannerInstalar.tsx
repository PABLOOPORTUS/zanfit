import { useEffect, useState } from 'react'
import HojaInstalar from './HojaInstalar'
import { alCambiarInstalacion, marcarInstalada, ofrecerInstalar } from '../lib/instalacion'

/**
 * Llamado a instalar la app (como en ESCENA), arriba en Entrenar. Desaparece al tocar "Ya la instalé" (en la hoja o
 * en la ✕ del banner) o al abrirla desde el ícono. En Ajustes siguen los pasos.
 */
export default function BannerInstalar() {
  const [visible, setVisible] = useState(ofrecerInstalar)
  const [abierta, setAbierta] = useState(false)
  useEffect(() => alCambiarInstalacion(() => setVisible(ofrecerInstalar())), [])
  if (!visible) return null
  return (
    <>
      <div className="relative mb-3">
        <button
          type="button"
          onClick={() => setAbierta(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-lima/60 bg-lima/10 p-3 pr-12 text-left active:bg-lima/20"
        >
          <span className="text-3xl" aria-hidden>
            📲
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Instala ZANFIT en tu celular</span>
            <span className="block text-sm text-texto-suave">Ábrela con un toque, como cualquier app. Toma 10 segundos.</span>
          </span>
          <span className="shrink-0 rounded-full bg-lima px-4 py-2 font-semibold text-fondo">Cómo</span>
        </button>
        <button
          type="button"
          onClick={marcarInstalada}
          aria-label="Ya la instalé: ocultar este aviso"
          className="absolute top-0 right-0 flex size-11 items-center justify-center rounded-xl text-texto-suave active:bg-borde"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {abierta && <HojaInstalar onCerrar={() => setAbierta(false)} />}
    </>
  )
}
