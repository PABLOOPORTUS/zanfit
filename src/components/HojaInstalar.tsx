import { useEffect, useState, type ReactNode } from 'react'
import DemoSafari from './DemoSafari'
import { alCambiarInstalacion, instalar, plataforma, puedeInstalarDirecto } from '../lib/instalacion'

/**
 * Hoja para instalar la app en el teléfono. Android: un botón (diálogo de Chrome) o, sin él, los pasos del menú.
 * iPhone en Safari: una animación de los 3 toques (Compartir → Agregar a pantalla de inicio → Agregar), porque Apple
 * no deja instalar con un botón. iPhone en otro navegador (WhatsApp, Instagram, Chrome…): copiar el link para Safari.
 * La abren `<PopupInstalar>` (login, solo Android), `<RecordatorioInstalar>` (después de entrenar) y Ajustes.
 */
export default function HojaInstalar({ onCerrar }: { onCerrar: () => void }) {
  const [directo, setDirecto] = useState(puedeInstalarDirecto)
  const [copiado, setCopiado] = useState(false)
  useEffect(() => alCambiarInstalacion(() => setDirecto(puedeInstalarDirecto())), [])
  const donde = plataforma()
  const cerrar = onCerrar

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Instalar ZANFIT">
      <div className="pb-safe mx-auto w-full max-w-lg animate-entrar rounded-t-3xl border-t border-lima/50 bg-superficie">
        <div className="p-6 text-center">
          <img src="/icon-192.png" alt="" className="mx-auto size-20 rounded-2xl shadow-lg shadow-lima/30" />
          <h2 className="mt-4 font-marca text-3xl font-bold tracking-tight">Instala ZANFIT</h2>
          <p className="mt-1 text-texto-suave">Queda en tu pantalla de inicio y se abre como una app.</p>

          {donde === 'android' &&
            (directo ? (
              <button
                type="button"
                onClick={async () => {
                  if (await instalar()) cerrar()
                }}
                className="mt-6 h-16 w-full rounded-2xl bg-lima text-xl font-bold text-fondo active:bg-lima-oscuro"
              >
                Instalar ZANFIT
              </button>
            ) : (
              <Pasos>
                <Paso n={1}>
                  Toca el menú <b className="font-marca text-lg">⋮</b> de Chrome (arriba a la derecha)
                </Paso>
                <Paso n={2}>
                  Toca <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>
                </Paso>
              </Pasos>
            ))}

          {donde === 'iphone-safari' && (
            <div className="mt-5">
              <DemoSafari />
              <p className="mt-3 text-sm text-texto-suave">
                Hazlo en Safari. Si no ves el botón Compartir, toca <b>···</b> primero.
              </p>
            </div>
          )}

          {donde === 'iphone-otro' && (
            <>
              <p className="mt-5 leading-snug">
                Para instalarla, abre este link en <b>Safari</b>.
              </p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard?.writeText(location.origin).catch(() => undefined)
                  setCopiado(true)
                }}
                className="mt-4 h-16 w-full rounded-2xl bg-lima text-xl font-bold text-fondo active:bg-lima-oscuro"
              >
                {copiado ? '¡Link copiado! Pégalo en Safari' : 'Copiar link'}
              </button>
              <p className="mt-2 text-sm text-texto-suave select-all">{location.host}</p>
            </>
          )}

          <button type="button" onClick={cerrar} className="mt-4 h-12 w-full text-texto-suave underline underline-offset-4">
            {donde === 'android' ? 'Ahora no' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Pasos({ children }: { children: ReactNode }) {
  return <ol className="mt-5 flex flex-col gap-3 text-left">{children}</ol>
}

function Paso({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-borde bg-fondo p-3 leading-snug">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lima font-marca text-lg font-bold text-fondo">{n}</span>
      <span>{children}</span>
    </li>
  )
}
