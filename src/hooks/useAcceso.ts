import { useContext } from 'react'
import { AccesoContext } from '../contexts/AccesoContext'

/** Estado de la cuenta (prueba, activa…) y si es administrador. `null` si todavía no se sabe. */
export function useAcceso() {
  return useContext(AccesoContext)
}
