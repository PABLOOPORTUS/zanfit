import { FICHAS, type Ficha } from './fichasEjercicios'
import { MUSCULOS_POR_GRUPO, type Musculos } from '../lib/musculos'
import type { Exercise } from '../types'

export interface MediosEjercicio {
  /** Ficha de free-exercise-db (fotos, músculos, nivel, equipamiento). Solo los del catálogo. */
  ficha?: Ficha
  musculos: Musculos
}

/** Busca por nombre del catálogo. Los del catálogo no se pueden renombrar, así que el nombre es estable. */
export function mediosDe(ejercicio: Pick<Exercise, 'nombre' | 'grupoMuscular' | 'propio'>): MediosEjercicio {
  const ficha = ejercicio.propio ? undefined : FICHAS[ejercicio.nombre]
  if (!ficha) return { musculos: MUSCULOS_POR_GRUPO[ejercicio.grupoMuscular] }
  return { ficha, musculos: { principales: ficha.principales, secundarios: ficha.secundarios } }
}
