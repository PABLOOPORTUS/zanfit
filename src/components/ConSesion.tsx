import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCuenta } from '../hooks/useCuenta'

/** La app exige cuenta: sin sesión, cualquier pantalla lleva al ingreso (y después se vuelve a la que se pidió). */
export default function ConSesion({ children }: { children: ReactNode }) {
  const { usuario } = useCuenta()
  const location = useLocation()
  if (!usuario) return <Navigate to="/cuenta" replace state={{ volverA: location.pathname + location.search }} />
  return children
}
