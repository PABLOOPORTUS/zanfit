import { useEffect, useState } from 'react'
import IconoWhatsapp from './IconoWhatsapp'
import { useCuenta } from '../hooks/useCuenta'
import { datosVenta, enlaceWhatsapp, type DatosVenta } from '../lib/acceso'

/**
 * "Apoya ZANFIT" (modo aporte voluntario): la app es gratis y quien quiera aporta por transferencia lo que quiera. Muestra
 * el aporte sugerido, los datos para transferir (con "Copiar") y un botón para avisar por WhatsApp. Sin presión.
 */
export default function HojaAporte({ onCerrar }: { onCerrar: () => void }) {
  const { usuario } = useCuenta()
  const [venta, setVenta] = useState<DatosVenta | null>(null)
  const [copiado, setCopiado] = useState(false)
  useEffect(() => {
    void datosVenta().then(setVenta)
  }, [])
  const whatsapp = venta?.contacto
    ? enlaceWhatsapp(venta.contacto, `¡Hola! Hice un aporte a ZANFIT 💚${usuario?.correo ? ` Mi correo es ${usuario.correo}.` : ''}`)
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" onClick={onCerrar}>
      <div
        className="pb-safe mx-auto max-h-[92dvh] w-full max-w-lg animate-entrar overflow-y-auto rounded-t-3xl bg-superficie"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-aporte"
      >
        <div className="px-5 pt-3 pb-5">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-borde" aria-hidden />
          <p className="mt-5 text-center text-4xl" aria-hidden>
            💚
          </p>
          <h2 id="titulo-aporte" className="mt-2 text-center font-marca text-2xl font-semibold">
            Apoya ZANFIT
          </h2>
          <p className="mt-2 text-center text-texto-suave">
            ZANFIT es gratis y lo seguirá siendo. Si te sirve y quieres que siga creciendo, puedes hacer un aporte voluntario, del monto que quieras.
          </p>
          {venta?.precio && <p className="mt-3 text-center text-sm text-texto-suave">Aporte sugerido: {venta.precio}</p>}

          {venta?.datos_transferencia && (
            <div className="mt-5 rounded-2xl bg-fondo p-4">
              <p className="text-xs font-semibold tracking-wider text-texto-suave uppercase">Datos para transferir</p>
              <p className="mt-2 leading-relaxed whitespace-pre-line select-all">{venta.datos_transferencia}</p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard?.writeText(venta.datos_transferencia).catch(() => undefined)
                  setCopiado(true)
                }}
                className="mt-3 h-11 rounded-full border border-borde px-4 text-sm font-medium active:bg-borde"
              >
                {copiado ? '✓ Datos copiados' : 'Copiar datos'}
              </button>
            </div>
          )}

          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-whatsapp font-semibold text-fondo active:opacity-80"
            >
              <IconoWhatsapp className="size-6" />
              Avisar mi aporte por WhatsApp
            </a>
          )}
          <button type="button" onClick={onCerrar} className="mt-3 h-12 w-full rounded-2xl font-semibold text-texto-suave active:bg-borde">
            Ahora no
          </button>
          <p className="mt-1 text-center text-sm text-texto-suave">¡Gracias por entrenar con nosotros!</p>
        </div>
      </div>
    </div>
  )
}
