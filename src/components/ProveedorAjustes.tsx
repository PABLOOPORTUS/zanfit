import { useLiveQuery } from 'dexie-react-hooks'
import type { ReactNode } from 'react'
import { AjustesContext } from '../contexts/AjustesContext'
import { obtenerAjustes } from '../db'

/**
 * Carga los ajustes antes de mostrar la app: así ninguna pantalla parte mostrando kg
 * y después cambia a lb (los inputs del entreno guardan su texto en estado local).
 */
export default function ProveedorAjustes({ children }: { children: ReactNode }) {
  const ajustes = useLiveQuery(obtenerAjustes)
  if (ajustes === undefined) return null
  return <AjustesContext.Provider value={ajustes}>{children}</AjustesContext.Provider>
}
