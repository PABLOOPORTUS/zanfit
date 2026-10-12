import { useContext } from 'react'
import { DescansoContext } from '../contexts/DescansoContext'

export function useDescanso() {
  const api = useContext(DescansoContext)
  if (!api) throw new Error('useDescanso necesita <ProveedorDescanso>')
  return api
}
