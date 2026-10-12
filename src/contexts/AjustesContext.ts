import { createContext } from 'react'
import type { Ajustes } from '../types'

export const AjustesContext = createContext<Ajustes | null>(null)
