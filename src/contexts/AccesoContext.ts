import { createContext } from 'react'
import type { Acceso } from '../lib/acceso'

/** Acceso de la cuenta con sesión (`null` si todavía no se pudo consultar). Lo provee `<ConAcceso>`. */
export const AccesoContext = createContext<Acceso | null>(null)
