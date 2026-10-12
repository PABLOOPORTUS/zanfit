import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { guardarAjustes } from '../db'
import { useAjustes } from '../hooks/useAjustes'
import { useCuenta } from '../hooks/useCuenta'
import { useJuego } from '../hooks/useLogros'
import { procesarFotoPerfil } from '../lib/medios'

type Props = {
  /** Línea bajo el nombre (por ejemplo, el último entreno o el correo). */
  detalle?: ReactNode
  /** En Ajustes: botones para cambiar o quitar la foto, solo el nombre y el nivel. En Entrenar: "Hola, …" y tocar el
   * banner lleva a Ajustes (el nivel ya está en la tarjeta de abajo). */
  editable?: boolean
  className?: string
}

/** Banner con la foto de perfil grande de fondo, el nombre y el nivel (animal). Sin foto, un degradado con la inicial. */
export default function BannerPerfil({ detalle, editable = false, className = 'h-48' }: Props) {
  const { fotoPerfil } = useAjustes()
  const { usuario } = useCuenta()
  const juego = useJuego()
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const nombre = usuario?.nombre ?? ''

  const contenido = (
    <>
      {fotoPerfil ? (
        // Recorte un poco arriba del centro: en las fotos de perfil la cara suele estar en la mitad superior.
        <img src={fotoPerfil} alt="" className="absolute inset-0 size-full object-cover object-[center_30%]" />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-lima/40 via-superficie to-fondo" aria-hidden>
          <span className="absolute -top-6 -right-4 font-marca text-[10rem] leading-none font-bold text-lima/25">
            {nombre.charAt(0).toUpperCase()}
          </span>
        </span>
      )}
      {/* Degradado para que el texto se lea sobre cualquier foto. */}
      <span className="absolute inset-0 bg-gradient-to-t from-fondo via-fondo/50 to-transparent" aria-hidden />
      <span className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
        <span className="min-w-0 flex-1">
          <span className="block font-marca text-3xl leading-tight font-bold tracking-tight drop-shadow-lg">
            {editable ? nombre : nombre ? `Hola, ${nombre}` : 'Hola'}
          </span>
          {detalle && <span className="block text-sm text-texto/80 drop-shadow">{detalle}</span>}
        </span>
        {juego && editable && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-lima/50 bg-fondo/70 py-1 pr-3 pl-1 backdrop-blur">
            <img src={`/medios/animales/${juego.nivel.archivo}-quieto.webp`} alt="" className="size-8" />
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-bold text-lima uppercase">Nivel {juego.nivel.numero}</span>
              <span className="block text-sm font-semibold">{juego.nivel.animal}</span>
            </span>
          </span>
        )}
      </span>
    </>
  )

  if (!editable)
    return (
      <Link to="/ajustes" aria-label="Perfil y ajustes" className={`relative block overflow-hidden rounded-2xl border border-borde ${className}`}>
        {contenido}
      </Link>
    )

  return (
    <div>
      <div className={`relative overflow-hidden rounded-2xl border border-borde ${className}`}>
        {contenido}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="absolute top-3 right-3 flex h-11 items-center gap-2 rounded-full bg-fondo/70 px-4 text-sm font-semibold backdrop-blur active:bg-fondo"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          {fotoPerfil ? 'Cambiar foto' : 'Agregar foto'}
        </button>
      </div>
      {fotoPerfil && (
        <button
          type="button"
          onClick={() => guardarAjustes({ fotoPerfil: undefined })}
          className="mt-1 h-11 px-1 text-sm text-texto-suave underline underline-offset-4"
        >
          Quitar foto
        </button>
      )}
      {error && (
        <p className="mt-1 text-sm text-peligro" role="alert">
          {error}
        </p>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Elegir foto de perfil"
        onChange={async (e) => {
          const archivo = e.target.files?.[0]
          e.target.value = ''
          if (!archivo) return
          try {
            setError(null)
            await guardarAjustes({ fotoPerfil: await procesarFotoPerfil(archivo) })
          } catch (err) {
            setError((err as Error).message || 'No se pudo usar esa foto.')
          }
        }}
      />
    </div>
  )
}
