import { useState } from 'react'
import FondoAcceso from './FondoAcceso'
import Marca from './Marca'
import { useCuenta } from '../hooks/useCuenta'

/** La cuenta se abrió en otro teléfono: una cuenta se usa en un solo teléfono a la vez. */
export default function PantallaOtroDispositivo({ onUsarAqui }: { onUsarAqui: () => Promise<unknown> }) {
  const cuenta = useCuenta()
  const [cambiando, setCambiando] = useState(false)
  return (
    <main className="pt-safe pb-safe relative mx-auto min-h-dvh max-w-lg px-4">
      <FondoAcceso />
      <div className="pt-8 pb-6 text-center">
        <Marca tamano={72} />
      </div>
      <section className="animate-entrar rounded-2xl border border-borde bg-fondo/80 p-5 backdrop-blur">
        <h1 className="font-marca text-3xl leading-tight font-semibold tracking-tight">Tu cuenta se abrió en otro teléfono</h1>
        <p className="mt-2 text-texto-suave">
          Cada cuenta de ZANFIT se usa en un solo teléfono a la vez. Si este es tu teléfono, toca{' '}
          <span className="font-semibold text-texto">Usar aquí</span>: el otro quedará fuera.
        </p>
        <p className="mt-3 text-sm text-texto-suave">
          En iPhone, abre ZANFIT siempre desde el ícono de la pantalla de inicio: Safari cuenta como otro teléfono.
        </p>
        <button
          type="button"
          disabled={cambiando}
          onClick={async () => {
            setCambiando(true)
            await onUsarAqui()
            setCambiando(false)
          }}
          className="mt-5 h-13 w-full rounded-2xl bg-lima font-semibold text-fondo active:bg-lima-oscuro disabled:opacity-60"
        >
          {cambiando ? 'Un momento…' : 'Usar aquí'}
        </button>
        <button
          type="button"
          onClick={() => void cuenta.cerrarSesion()}
          className="mt-3 h-12 w-full rounded-2xl border border-borde font-semibold active:bg-borde"
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  )
}
