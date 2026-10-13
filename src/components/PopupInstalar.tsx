import { useEffect, useState, type ReactNode } from 'react'
import { alCambiarInstalacion, esInstalada, instalar, plataforma, puedeInstalarDirecto } from '../lib/instalacion'

const CLAVE = 'zanfit:popup-instalar'
const leerCerrado = () => {
  try {
    return sessionStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

/**
 * Popup sobre el login para instalar la app antes de usarla. Solo en teléfonos y si todavía no está instalada.
 * Android: un botón (diálogo de Chrome). iPhone en Safari: los 3 toques de "Agregar a pantalla de inicio".
 * iPhone en otro navegador (WhatsApp, Instagram, Chrome…): copiar el link para abrirlo en Safari.
 * "Ahora no" lo cierra hasta la próxima vez que abra la página.
 */
export default function PopupInstalar() {
  const [cerrado, setCerrado] = useState(leerCerrado)
  const [directo, setDirecto] = useState(puedeInstalarDirecto)
  const [copiado, setCopiado] = useState(false)
  useEffect(() => alCambiarInstalacion(() => setDirecto(puedeInstalarDirecto())), [])

  const donde = plataforma()
  if (cerrado || donde === 'computador' || esInstalada()) return null

  function cerrar() {
    setCerrado(true)
    try {
      sessionStorage.setItem(CLAVE, '1')
    } catch {
      // Sin sessionStorage vuelve a aparecer al recargar; no es grave.
    }
  }

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
            <Pasos>
              <Paso n={1}>
                Toca <IconoCompartir /> <b>Compartir</b> en la barra de Safari{' '}
                <span className="text-texto-suave">(si no lo ves, toca ··· primero)</span>
              </Paso>
              <Paso n={2}>
                Toca <IconoAgregar /> <b>Agregar a pantalla de inicio</b>
              </Paso>
              <Paso n={3}>
                Toca <b>Agregar</b>. ¡Listo!
              </Paso>
            </Pasos>
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
            Ahora no
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

/** Ícono de Compartir de Safari (cuadrado con flecha hacia arriba). */
function IconoCompartir() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline -mt-1 text-azul-ios"
      aria-hidden
    >
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5v10h14V11h-1" />
    </svg>
  )
}

/** Ícono de "Agregar a pantalla de inicio" (cuadrado con +). */
function IconoAgregar() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline -mt-1"
      aria-hidden
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}
