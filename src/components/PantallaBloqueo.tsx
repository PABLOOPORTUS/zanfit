import { useEffect, useState } from 'react'
import FondoAcceso from './FondoAcceso'
import Marca from './Marca'
import { useCuenta } from '../hooks/useCuenta'
import { datosVenta, puedeUsar, type Acceso, type DatosVenta } from '../lib/acceso'

const TITULOS: Record<Acceso['estado'], { titulo: string; detalle: string }> = {
  prueba: { titulo: 'Tu prueba terminó', detalle: 'Esperamos que te haya gustado. Activa tu cuenta para seguir entrenando con ZANFIT.' },
  bloqueada: { titulo: 'Tu cuenta está pausada', detalle: 'Escríbenos para reactivarla.' },
  'sin-cuenta': { titulo: 'Tu cuenta no está activa', detalle: 'Para usar ZANFIT necesitas activarla con un pago único.' },
  activa: { titulo: '', detalle: '' },
}

/** WhatsApp: si el contacto es un número, se ofrece abrir el chat (además de mostrarlo como texto). */
function enlaceWhatsapp(contacto: string): string | null {
  const numero = contacto.replace(/[^\d]/g, '')
  return numero.length >= 8 ? `https://wa.me/${numero}` : null
}

/** Pantalla cuando la cuenta no puede usar la app: datos para pagar y "Ya pagué". Los entrenos no se pierden. */
export default function PantallaBloqueo({ acceso, onRevisar }: { acceso: Acceso; onRevisar: () => Promise<Acceso | null> }) {
  const cuenta = useCuenta()
  const [venta, setVenta] = useState<DatosVenta | null>(null)
  const [revisando, setRevisando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  useEffect(() => {
    void datosVenta().then(setVenta)
  }, [])
  const textos = TITULOS[acceso.estado]
  const whatsapp = venta?.contacto ? enlaceWhatsapp(venta.contacto) : null

  return (
    <main className="pt-safe pb-safe relative mx-auto min-h-dvh max-w-lg px-4">
      <FondoAcceso />
      <div className="pt-8 pb-6 text-center">
        <Marca className="text-4xl drop-shadow-lg" />
      </div>
      <section className="animate-entrar rounded-2xl border border-borde bg-fondo/80 p-5 backdrop-blur">
        <h1 className="font-marca text-3xl leading-tight font-bold tracking-tight">{textos.titulo}</h1>
        <p className="mt-2 text-texto-suave">{textos.detalle}</p>

        {venta?.precio && (
          <p className="mt-4 font-marca text-4xl font-bold text-lima">
            {venta.precio} <span className="text-base font-semibold text-texto-suave">pago único</span>
          </p>
        )}
        {venta?.datos_transferencia && (
          <div className="mt-4 rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-sm font-bold tracking-wide text-texto-suave uppercase">Datos para transferir</p>
            <p className="mt-2 leading-relaxed whitespace-pre-line select-all">{venta.datos_transferencia}</p>
          </div>
        )}
        {venta?.contacto && (
          <p className="mt-3 text-texto-suave">
            Después de transferir, envía el comprobante a <span className="font-semibold text-texto select-all">{venta.contacto}</span>
            {whatsapp && (
              <>
                {' '}
                <a href={whatsapp} target="_blank" rel="noreferrer" className="font-semibold text-lima underline underline-offset-4">
                  (abrir WhatsApp)
                </a>
              </>
            )}
            .
          </p>
        )}
        <p className="mt-3 text-sm text-texto-suave">
          Tus entrenos, tu plan y tus logros están guardados: al activar tu cuenta sigues donde quedaste.
        </p>

        {aviso && (
          <p className="mt-3 text-sm text-lima" role="status">
            {aviso}
          </p>
        )}
        <button
          type="button"
          disabled={revisando}
          onClick={async () => {
            setRevisando(true)
            setAviso(null)
            const nuevo = await onRevisar()
            setRevisando(false)
            if (!nuevo || !puedeUsar(nuevo)) setAviso('Todavía no está activa. Apenas confirmemos tu pago, se activa y podrás entrar.')
          }}
          className="mt-5 h-16 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro disabled:opacity-60"
        >
          {revisando ? 'Revisando…' : 'Ya pagué: revisar de nuevo'}
        </button>
        <button
          type="button"
          onClick={() => void cuenta.cerrarSesion()}
          className="mt-3 h-14 w-full rounded-2xl border border-borde font-semibold active:bg-borde"
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  )
}
