import { useEffect, useState, type ReactNode } from 'react'
import { alCambiarInstalacion, instalar, marcarInstalada, plataforma, puedeInstalarDirecto } from '../lib/instalacion'

/**
 * Hoja con los pasos para dejar ZANFIT en la pantalla de inicio (mismo formato que en ESCENA): ícono, pestañas iPhone
 * y Android (parte en la del teléfono), 3 pasos numerados y "Ahora no" / "Ya la instalé". En Android con Chrome, un
 * botón de un toque; dentro de Instagram o Facebook, cómo abrirla en el navegador. La abren `<PopupInstalar>` (login),
 * `<BannerInstalar>` (Entrenar), `<RecordatorioInstalar>` (después de entrenar) y Ajustes.
 */
export default function HojaInstalar({ onCerrar }: { onCerrar: () => void }) {
  const detectada = plataforma()
  const [vista, setVista] = useState<'iphone' | 'android'>(detectada === 'android' ? 'android' : 'iphone')
  const [directo, setDirecto] = useState(puedeInstalarDirecto)
  const [copiado, setCopiado] = useState(false)
  useEffect(() => alCambiarInstalacion(() => setDirecto(puedeInstalarDirecto())), [])
  const listo = () => {
    marcarInstalada()
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm" onClick={onCerrar}>
      <div
        className="pb-safe mx-auto max-h-[92dvh] w-full max-w-lg animate-entrar overflow-y-auto rounded-t-3xl border-t border-lima/50 bg-superficie"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-instalar"
      >
        <div className="px-5 pt-3 pb-5">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-borde" aria-hidden />
          <img src="/icon-192.png" alt="" className="mx-auto mt-5 size-16 rounded-2xl shadow-lg shadow-lima/30" />
          <h2 id="titulo-instalar" className="mt-4 text-center font-marca text-2xl leading-tight font-bold tracking-tight">
            Lleva <span className="text-lima">ZANFIT</span> en tu celular
          </h2>
          <p className="mt-2 text-center text-texto-suave">
            Instálala como app: se abre con un toque desde tu pantalla de inicio, a pantalla completa y sin descargar nada de una tienda.
          </p>

          {detectada === 'app-interna' ? (
            <div className="mt-5 rounded-2xl border border-borde bg-fondo p-4 leading-snug">
              <p>
                <b>Estás viendo ZANFIT dentro de otra app</b> (como Instagram o Facebook), y desde ahí no se puede instalar.
              </p>
              <p className="mt-2">
                Toca el menú <b>⋯</b> o <b>⋮</b> de arriba y elige <b>“Abrir en el navegador”</b> (Safari o Chrome). Ahí verás los pasos.
              </p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard?.writeText(location.origin).catch(() => undefined)
                  setCopiado(true)
                }}
                className="mt-3 h-12 w-full rounded-xl border border-lima/60 font-semibold text-lima active:bg-lima/10"
              >
                {copiado ? '✓ Link copiado' : 'Copiar link de ZANFIT'}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl border border-borde bg-fondo p-1" role="tablist">
                {(['iphone', 'android'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="tab"
                    aria-selected={vista === v}
                    onClick={() => setVista(v)}
                    className={`h-11 rounded-xl font-semibold ${vista === v ? 'bg-lima text-fondo' : 'text-texto-suave active:bg-borde'}`}
                  >
                    {v === 'iphone' ? 'iPhone' : 'Android'}
                  </button>
                ))}
              </div>

              {vista === 'iphone' ? (
                <Pasos>
                  <Paso n={1}>
                    Toca el botón <b>Compartir</b> <IconoCompartir />: en Safari está abajo al centro; en Chrome, arriba a la derecha.
                  </Paso>
                  <Paso n={2}>
                    Desliza hacia abajo y elige <b>“Agregar a pantalla de inicio”</b> <IconoAgregar />
                  </Paso>
                  <Paso n={3}>
                    Toca <b>“Agregar”</b> arriba a la derecha. ¡Listo! ZANFIT queda junto a tus apps.
                  </Paso>
                </Pasos>
              ) : directo ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (await instalar()) listo()
                  }}
                  className="mt-5 h-13 w-full rounded-2xl bg-lima text-xl font-bold text-fondo active:bg-lima-oscuro"
                >
                  Instalar ZANFIT
                </button>
              ) : (
                <Pasos>
                  <Paso n={1}>
                    En Chrome, toca el menú <b className="font-marca text-lg">⋮</b> arriba a la derecha.
                  </Paso>
                  <Paso n={2}>
                    Elige <b>“Instalar app”</b> o <b>“Agregar a la pantalla principal”</b>.
                  </Paso>
                  <Paso n={3}>
                    Confirma con <b>“Instalar”</b>. ZANFIT aparecerá en tu pantalla de inicio.
                  </Paso>
                </Pasos>
              )}
            </>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={onCerrar} className="h-12 rounded-2xl border border-borde font-semibold active:bg-borde">
              Ahora no
            </button>
            <button type="button" onClick={listo} className="h-12 rounded-2xl bg-lima font-bold text-fondo active:bg-lima-oscuro">
              Ya la instalé
            </button>
          </div>
          <p className="mt-3 text-center text-sm text-texto-suave">Siempre puedes volver a ver estos pasos en Ajustes.</p>
        </div>
      </div>
    </div>
  )
}

function Pasos({ children }: { children: ReactNode }) {
  return <ol className="mt-4 flex flex-col gap-3">{children}</ol>
}

function Paso({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 leading-snug">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lima font-marca font-bold text-fondo">{n}</span>
      <span className="pt-1">{children}</span>
    </li>
  )
}

function IconoCompartir() {
  return (
    <svg
      className="inline-block align-[-3px] text-lima"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="ícono compartir"
    >
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  )
}

function IconoAgregar() {
  return (
    <svg
      className="inline-block align-[-3px] text-lima"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="ícono agregar"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}
