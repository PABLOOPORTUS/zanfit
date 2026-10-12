import { EJERCICIOS_BASE } from '../db/ejerciciosBase'
import { FICHAS } from '../db/fichasEjercicios'
import { etiquetaEquipo, etiquetaGrupo } from './catalogos'
import { CATEGORIAS, nombresMusculos, type Categoria } from './musculos'
import { normalizar } from './texto'
import type { Equipo, Exercise, GrupoMuscular } from '../types'

export interface Filtros {
  busqueda: string
  grupo: GrupoMuscular | null
  equipo: Equipo | null
  tipo: Categoria | null
}

/** Cuántos ejercicios se muestran de una vez en las listas (con 800+ en el catálogo, dibujar todos traba el teléfono). */
export const POR_PAGINA = 50

const BASICOS = new Set(EJERCICIOS_BASE.map((e) => e.nombre))
/** 0 = propios y los básicos de gimnasio (los 79 de siempre), 1 = el resto del catálogo ampliado. */
const prioridad = (e: Exercise) => (e.propio || BASICOS.has(e.nombre) ? 0 : 1)

/**
 * Filtra y ordena: primero los propios y los básicos, después el resto (cada parte en el orden que traía).
 * Cada palabra de la búsqueda debe aparecer en el nombre, el grupo, el equipo, el tipo o los músculos:
 * "press mancuernas" encuentra "Press inclinado con mancuernas"; "gluteos banda", los de glúteos con banda elástica.
 */
export function filtrarEjercicios(ejercicios: Exercise[], { busqueda, grupo, equipo, tipo }: Filtros): Exercise[] {
  const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean)
  return ejercicios
    .filter((e) => {
      if (grupo !== null && e.grupoMuscular !== grupo) return false
      if (equipo !== null && e.equipo !== equipo) return false
      const ficha = e.propio ? undefined : FICHAS[e.nombre]
      if (tipo !== null && (ficha?.categoria ?? 'fuerza') !== tipo) return false
      if (palabras.length === 0) return true
      const extra = ficha ? `${CATEGORIAS[ficha.categoria]} ${nombresMusculos([...ficha.principales, ...ficha.secundarios])}` : ''
      const texto = normalizar(`${e.nombre} ${etiquetaGrupo(e.grupoMuscular)} ${etiquetaEquipo(e.equipo)} ${extra}`)
      return palabras.every((p) => texto.includes(p))
    })
    .sort((a, b) => prioridad(a) - prioridad(b))
}
