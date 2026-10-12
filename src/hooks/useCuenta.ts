import { useContext } from 'react'
import { CuentaContext } from '../contexts/CuentaContext'

export function useCuenta() {
  const api = useContext(CuentaContext)
  if (!api) throw new Error('useCuenta necesita <ProveedorCuenta>')
  return api
}
