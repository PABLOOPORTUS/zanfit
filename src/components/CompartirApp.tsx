import { useEffect, useState } from 'react'

const TEXTO = '¡Entrena con ZANFIT! Tu plan de entrenamiento personalizado. Pruébala gratis por 7 días:'

/** Código QR y botón para compartir el link de ZANFIT (en Administración). El QR se puede guardar para historias. */
export default function CompartirApp() {
  const link = location.origin
  const [qr, setQr] = useState<string | null>(null)
  useEffect(() => {
    // La librería del QR solo se descarga aquí (Administración), no en el resto de la app.
    // La librería del QR pinta en canvas: los colores van en hex (son los del tema: fondo y lima).
    void import('qrcode').then((m) => m.toDataURL(link, { width: 480, margin: 2, color: { dark: '#0a0a0a', light: '#c6ff3d' } }).then(setQr))
  }, [link])

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-4 text-center">
      {qr && <img src={qr} alt={`Código QR de ${link}`} className="mx-auto size-48 rounded-xl" />}
      <p className="mt-2 font-semibold select-all">{link.replace(/^https?:\/\//, '')}</p>
      <p className="text-sm text-texto-suave">Al escanearlo o abrir el link, la app les ofrece instalarse.</p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.share({ text: `${TEXTO}\n${link}` })
          } catch {
            await navigator.clipboard?.writeText(`${TEXTO}\n${link}`).catch(() => undefined)
          }
        }}
        className="mt-3 h-12 w-full rounded-xl bg-lima font-bold text-fondo active:bg-lima-oscuro"
      >
        Compartir link
      </button>
      {qr && (
        <button
          type="button"
          onClick={async () => {
            const archivo = new File([await (await fetch(qr)).blob()], 'zanfit-qr.png', { type: 'image/png' })
            if (navigator.canShare?.({ files: [archivo] })) await navigator.share({ files: [archivo] }).catch(() => undefined)
          }}
          className="mt-2 h-12 w-full rounded-xl border border-borde font-semibold active:bg-borde"
        >
          Guardar o compartir el QR
        </button>
      )}
    </div>
  )
}
