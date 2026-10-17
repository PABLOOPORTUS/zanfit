import { FICHAS } from '../db/fichasEjercicios'
import type { Exercise, WorkoutSet } from '../types'

/**
 * Cardio en el entreno: en vez de peso y reps se anotan los minutos y, según la máquina, la velocidad y la inclinación
 * (trotadora, caminata) o el nivel de resistencia (bicicleta, elíptica, escaladora, remo). En las rutinas, las "reps"
 * de un ejercicio de cardio son los minutos.
 */

export type CampoCardio = 'minutos' | 'velocidad' | 'inclinacion' | 'nivel'

export const CAMPOS_CARDIO: Record<CampoCardio, { etiqueta: string; unidad: string; max: number; decimales: boolean }> = {
  minutos: { etiqueta: 'Min', unidad: 'min', max: 300, decimales: false },
  velocidad: { etiqueta: 'km/h', unidad: 'km/h', max: 30, decimales: true },
  inclinacion: { etiqueta: 'Incl. %', unidad: '%', max: 40, decimales: true },
  nivel: { etiqueta: 'Nivel', unidad: '', max: 30, decimales: false },
}

/** Minutos por defecto de un ejercicio de cardio sin historial ni rutina. */
export const MINUTOS_POR_DEFECTO = 20

const TROTADORA = /trotadora|caminata|trote|trotar|cinta|correr/i
const CON_NIVEL = /bicicleta|el[ií]ptica|escaladora|step|remo/i

/** ¿Es de cardio? Los del catálogo según su ficha; los propios, por el nombre (trotadora, bicicleta…). */
export function esCardio(ejercicio: Pick<Exercise, 'nombre' | 'propio'>): boolean {
  if (!ejercicio.propio) return FICHAS[ejercicio.nombre]?.categoria === 'cardio'
  return TROTADORA.test(ejercicio.nombre) || CON_NIVEL.test(ejercicio.nombre)
}

/** Qué se anota en cada tramo de cardio. `null` si el ejercicio no es de cardio. */
export function camposCardio(ejercicio: Pick<Exercise, 'nombre' | 'propio'>): CampoCardio[] | null {
  if (!esCardio(ejercicio)) return null
  if (TROTADORA.test(ejercicio.nombre)) return ['minutos', 'velocidad', 'inclinacion']
  if (CON_NIVEL.test(ejercicio.nombre)) return ['minutos', 'nivel']
  return ['minutos']
}

const formato = (n: number) => new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(n)

/** "30 min · 5,5 km/h · 8 %" o "20 min · nivel 6". */
export function textoCardio(serie: Pick<WorkoutSet, CampoCardio>): string {
  const partes = [`${formato(serie.minutos ?? 0)} min`]
  if (serie.velocidad) partes.push(`${formato(serie.velocidad)} km/h`)
  if (serie.inclinacion) partes.push(`${formato(serie.inclinacion)} %`)
  if (serie.nivel) partes.push(`nivel ${formato(serie.nivel)}`)
  return partes.join(' · ')
}

/** Distancia en km (solo con velocidad). */
export const distanciaKm = (series: Pick<WorkoutSet, 'minutos' | 'velocidad'>[]) =>
  series.reduce((s, x) => s + ((x.velocidad ?? 0) * (x.minutos ?? 0)) / 60, 0)

/**
 * MET de caminar o trotar en trotadora con las ecuaciones del ACSM (American College of Sports Medicine):
 * VO2 (ml/kg/min) = 3,5 + 0,1·v + 1,8·v·pendiente caminando, y 3,5 + 0,2·v + 0,9·v·pendiente trotando (v en m/min);
 * MET = VO2 / 3,5. Sobre 7 km/h se considera trote.
 */
export function metTrotadora(velocidadKmh: number, inclinacionPct = 0): number {
  const v = (velocidadKmh * 1000) / 60
  const g = inclinacionPct / 100
  const vo2 = velocidadKmh < 7 ? 3.5 + 0.1 * v + 1.8 * v * g : 3.5 + 0.2 * v + 0.9 * v * g
  return vo2 / 3.5
}

/** Objetivo de un ejercicio en una rutina: "20 min" o "2 × 10 min" en el cardio (las reps son minutos). */
export const objetivoCardio = (series: number, minutos: number) => (series > 1 ? `${series} × ${minutos} min` : `${minutos} min`)

/** Series y reps (minutos) por defecto al agregar un ejercicio a una rutina. */
export const objetivoPorDefecto = (ejercicio: Pick<Exercise, 'nombre' | 'propio'> | undefined) =>
  ejercicio && esCardio(ejercicio) ? { seriesObjetivo: 1, repsObjetivo: MINUTOS_POR_DEFECTO } : { seriesObjetivo: 3, repsObjetivo: 10 }
