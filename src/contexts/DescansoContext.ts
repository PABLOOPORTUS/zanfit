import { createContext } from 'react'

export interface Descanso {
  /** Timestamp en que termina. */
  fin: number
  /** Duración total en ms (para la barra de progreso). */
  total: number
}

export interface DescansoApi {
  descanso: Descanso | null
  iniciar: (segundos: number) => void
  sumar: (segundos: number) => void
  saltar: () => void
}

export const DescansoContext = createContext<DescansoApi | null>(null)
