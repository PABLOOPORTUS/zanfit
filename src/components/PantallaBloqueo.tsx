import { useEffect, useState } from 'react'
import FondoAcceso from './FondoAcceso'
import IconoWhatsapp from './IconoWhatsapp'
import Marca from './Marca'
import { useCuenta } from '../hooks/useCuenta'
import { datosVenta, enlaceWhatsapp, puedeUsar, type Acceso, type DatosVenta } from '../lib/acceso'

const TITULOS: Record<Acceso['estado'], { titulo: string; detalle: string }> = {
  prueba: { titulo: 'Tu prueba terminó', detalle: 'Esperamos que te haya gustado. Suscríbete para seguir entrenando con ZANFIT.' },
  pendiente: { titulo: 'Tu cuenta está por activarse', detalle: 'Escríbenos para activarla y empezar a entrenar.' },
  bloqueada: { titulo: 'Tu cuenta está pausada', detalle: 'Escríbenos para reactivarla.' },
  'sin-cuenta': { titulo: 'Tu cuenta no está activa', detalle: 'Para usar ZANFIT necesitas activarla con un pago único.' },
  activa: { titulo: 'Tu suscripción venció', detalle: 'Renueva para seguir entrenando con ZANFIT.' },
}

/** Lo que incluye la suscripción (pantalla al terminar la prueba). */
const INCLUYE = [
  'Tu plan de entrenamiento personalizado, ajustado con IA',
  'Más de 870 ejercicios con fotos y mapa muscular',
  'Registro de entrenos, récords, niveles y logros',
  'Tus datos guardados en la nube, en cualquier teléfono',
]

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
  const whatsapp = venta?.contacto
    ? enlaceWhatsapp(venta.contacto, `¡Hola! Quiero suscribirme a ZANFIT.${cuenta.usuario?.correo ? ` Mi correo es ${cuenta.usuario.correo}.` : ''}`)
    : null

  return (
    <main className="pt-safe pb-safe relative mx-auto min-h-dvh max-w-lg px-4">
      <FondoAcceso />
      <div className="pt-8 pb-6 text-center">
        <Marca tamano={72} />
      </div>
      <section className="animate-entrar rounded-2xl border border-borde bg-fondo/80 p-5 backdrop-blur">
        <h1 className="font-marca text-3xl leading-tight font-semibold tracking-tight">{textos.titulo}</h1>
        <p className="mt-2 text-texto-suave">{textos.detalle}</p>

        {venta?.precio && <p className="mt-4 font-marca text-4xl font-semibold text-lima">{venta.precio}</p>}
        <ul className="mt-4 flex flex-col gap-1.5 text-sm">
          {INCLUYE.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="font-semibold text-lima" aria-hidden>
                ✓
              </span>
              {x}
            </li>
          ))}
        </ul>
        {venta?.datos_transferencia && (
          <div className="mt-4 rounded-2xl bg-superficie p-4">
            <p className="text-sm font-semibold tracking-wide text-texto-suave uppercase">Datos para transferir</p>
            <p className="mt-2 leading-relaxed whitespace-pre-line select-all">{venta.datos_transferencia}</p>
          </div>
        )}
        {venta?.contacto && (
          <p className="mt-4 text-texto-suave">
            Escríbeme por WhatsApp al <span className="font-semibold text-texto select-all">{venta.contacto}</span>: te cuento cómo pagar y activo tu
            cuenta.
          </p>
        )}
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-whatsapp font-semibold text-fondo active:opacity-80"
          >
            <IconoWhatsapp className="size-7" />
            Escríbeme por WhatsApp
          </a>
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
          className={`mt-3 h-12 w-full rounded-2xl font-semibold disabled:opacity-60 ${whatsapp ? 'border border-lima/60 text-lima active:bg-lima/10' : 'bg-lima text-fondo active:bg-lima-oscuro'}`}
        >
          {revisando ? 'Revisando…' : 'Ya pagué: revisar de nuevo'}
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
