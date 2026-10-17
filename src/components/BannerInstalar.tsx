import { useEffect, useState } from 'react'
import HojaInstalar from './HojaInstalar'
import { alCambiarInstalacion, ofrecerInstalar } from '../lib/instalacion'

/** Llamado a instalar la app (como en ESCENA), arriba en Entrenar. Desaparece al tocar "Ya la instalé" o al abrirla desde el ícono. */
export default function BannerInstalar() {
  const [visible, setVisible] = useState(ofrecerInstalar)
  const [abierta, setAbierta] = useState(false)
  useEffect(() => alCambiarInstalacion(() => setVisible(ofrecerInstalar())), [])
  if (!visible) return null
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-lima/60 bg-lima/10 p-3 text-left active:bg-lima/20"
      >
        <span className="text-3xl" aria-hidden>
          📲
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">Instala ZANFIT en tu celular</span>
          <span className="block text-sm text-texto-suave">Ábrela con un toque, como cualquier app. Toma 10 segundos.</span>
        </span>
        <span className="shrink-0 rounded-full bg-lima px-4 py-2 font-bold text-fondo">Cómo</span>
      </button>
      {abierta && <HojaInstalar onCerrar={() => setAbierta(false)} />}
    </>
  )
}
