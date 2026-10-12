import { useEffect, useState } from 'react'
import { compartirImagen, crearImagen, type DatosImagen } from '../lib/imagenCompartir'

/**
 * Botón "Compartir" que arma la imagen apenas se muestra (en iPhone la hoja de compartir debe abrirse en el mismo
 * toque, sin esperar) y la entrega con la hoja de compartir del teléfono.
 */
export default function BotonCompartir({
  datos,
  texto,
  etiqueta = 'Compartir en redes',
}: {
  datos: DatosImagen | null
  texto: string
  etiqueta?: string
}) {
  const [imagen, setImagen] = useState<Blob | null>(null)
  const clave = JSON.stringify(datos)

  useEffect(() => {
    if (!datos) return
    let vigente = true
    void crearImagen(datos).then((b) => vigente && setImagen(b))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `clave` resume `datos`
  }, [clave])

  return (
    <button
      type="button"
      disabled={!imagen}
      onClick={() => imagen && void compartirImagen(imagen, texto)}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-lima/60 font-semibold text-lima active:bg-lima/10 disabled:opacity-50"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      </svg>
      {imagen ? etiqueta : 'Preparando imagen…'}
    </button>
  )
}
