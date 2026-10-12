import { useAjustes } from '../hooks/useAjustes'
import { useCuenta } from '../hooks/useCuenta'

/** Foto de perfil o, si no hay, la inicial del nombre (con cuenta) o un ícono de persona (sin cuenta). */
export default function Avatar({ className = 'size-10 text-lg' }: { className?: string }) {
  const { fotoPerfil } = useAjustes()
  const { usuario } = useCuenta()
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`
  if (fotoPerfil) return <img src={fotoPerfil} alt="" className={`${base} object-cover`} />
  if (usuario)
    return (
      <span className={`${base} bg-lima font-marca font-bold text-fondo`} aria-hidden>
        {usuario.nombre.charAt(0).toUpperCase()}
      </span>
    )
  return (
    <span className={`${base} border border-borde bg-superficie text-texto-suave`} aria-hidden>
      <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    </span>
  )
}
