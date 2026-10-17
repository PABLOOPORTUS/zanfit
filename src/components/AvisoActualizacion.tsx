import { useEffect, useState } from 'react'

/**
 * Aviso "Hay una versión nueva": el service worker (vite-plugin-pwa, `autoUpdate`) descarga la versión nueva en segundo
 * plano y toma el control, pero la pantalla sigue con el código anterior hasta recargar. En el iPhone, una app del
 * ícono casi nunca se recarga sola, así que se ofrece hacerlo con un toque.
 * Además, al volver a la app se revisa si hay una versión nueva (iOS no lo hace al traerla del segundo plano).
 */
export default function AvisoActualizacion() {
  const [nueva, setNueva] = useState(false)

  useEffect(() => {
    const sw = navigator.serviceWorker
    if (!sw) return
    // Sin controlador es la primera instalación: no hay nada "nuevo" que avisar.
    const habiaControlador = !!sw.controller
    // Muchas veces la app se recarga sola al actualizarse: el aviso espera un poco para no aparecer y desaparecer.
    let espera = 0
    const alCambiar = () => {
      if (habiaControlador) espera = window.setTimeout(() => setNueva(true), 2500)
    }
    const alVolver = () => {
      if (document.visibilityState === 'visible') void sw.getRegistration().then((r) => r?.update().catch(() => {}))
    }
    sw.addEventListener('controllerchange', alCambiar)
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      clearTimeout(espera)
      sw.removeEventListener('controllerchange', alCambiar)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [])

  if (!nueva) return null
  return (
    <div className="pt-safe fixed inset-x-0 top-0 z-50 px-4" role="status">
      <div className="mx-auto mt-2 flex max-w-lg items-center gap-3 rounded-2xl border border-lima/60 bg-superficie p-3 shadow-lg">
        <p className="min-w-0 flex-1 leading-snug font-semibold">Hay una versión nueva de ZANFIT</p>
        <button
          type="button"
          onClick={() => location.reload()}
          className="h-12 shrink-0 rounded-xl bg-lima px-4 font-semibold text-fondo active:bg-lima-oscuro"
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}
