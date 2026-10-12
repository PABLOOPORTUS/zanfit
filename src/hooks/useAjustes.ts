import { useContext } from 'react'
import { AjustesContext } from '../contexts/AjustesContext'
import { aKg, aUnidad, formatearPeso, formatearVolumen } from '../lib/formato'

export function useAjustes() {
  const ajustes = useContext(AjustesContext)
  if (!ajustes) throw new Error('useAjustes necesita <ProveedorAjustes>')
  return ajustes
}

/** Formatea y convierte pesos según la unidad elegida. Los datos siempre se guardan en kg. */
export function useUnidad() {
  const { unidad } = useAjustes()
  return {
    unidad,
    peso: (kg: number, decimales?: number) => formatearPeso(kg, unidad, decimales),
    volumen: (kg: number) => formatearVolumen(kg, unidad),
    aUnidad: (kg: number) => aUnidad(kg, unidad),
    aKg: (valor: number) => aKg(valor, unidad),
  }
}
