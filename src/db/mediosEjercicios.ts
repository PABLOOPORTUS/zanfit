import type { Exercise, GrupoMuscular } from '../types'

/**
 * Recursos gráficos del catálogo, tomados del proyecto wger (wger.de). Los archivos están en public/medios.
 * Solo se usan recursos con licencia verificada (ver la pantalla Créditos y CLAUDE.md):
 * - Diagramas de músculos: "Muscular system" de Termininja (Wikimedia Commons), adaptados por wger. CC BY-SA 3.0.
 *   En ZANFIT se recolorearon (lima) y se optimizaron.
 * - Dibujos de los ejercicios: Everkinetic, CC BY-SA 3.0. En ZANFIT se reducieron, se pasaron a WebP y se muestran con
 *   los colores invertidos para el modo oscuro.
 */

/** Ids de músculo de wger (los mismos números de los archivos principal-N.svg / secundario-N.svg). */
export const MUSCULOS: Record<number, { nombre: string; vista: 'frente' | 'espalda' }> = {
  1: { nombre: 'Bíceps', vista: 'frente' },
  2: { nombre: 'Deltoides', vista: 'frente' },
  3: { nombre: 'Serrato', vista: 'frente' },
  4: { nombre: 'Pectoral', vista: 'frente' },
  5: { nombre: 'Tríceps', vista: 'espalda' },
  6: { nombre: 'Abdominales', vista: 'frente' },
  7: { nombre: 'Gemelos', vista: 'espalda' },
  8: { nombre: 'Glúteos', vista: 'espalda' },
  9: { nombre: 'Trapecio', vista: 'espalda' },
  10: { nombre: 'Cuádriceps', vista: 'frente' },
  11: { nombre: 'Isquiotibiales', vista: 'espalda' },
  12: { nombre: 'Dorsal ancho', vista: 'espalda' },
  13: { nombre: 'Braquial', vista: 'frente' },
  14: { nombre: 'Oblicuos', vista: 'frente' },
  15: { nombre: 'Sóleo', vista: 'espalda' },
}

export interface Musculos {
  principales: number[]
  secundarios: number[]
}

/** Para ejercicios propios (o del catálogo sin datos): los músculos típicos de su grupo. */
const POR_GRUPO: Record<GrupoMuscular, Musculos> = {
  pecho: { principales: [4], secundarios: [2, 5] },
  espalda: { principales: [12], secundarios: [1, 9] },
  piernas: { principales: [10, 8], secundarios: [11] },
  hombros: { principales: [2], secundarios: [9] },
  biceps: { principales: [1], secundarios: [13] },
  triceps: { principales: [5], secundarios: [] },
  core: { principales: [6], secundarios: [14] },
}

interface MediosEjercicio {
  musculos: Musculos
  /** Ejercicio de wger del que salen los dibujos (https://wger.de/es/exercise/<id>/view-base), para rastrear el origen. */
  wgerId?: number
  /** Archivos en /medios/ejercicios: posición inicial y final. */
  dibujos?: string[]
}

const m = (principales: number[], secundarios: number[] = []): Musculos => ({ principales, secundarios })
const dibujos = (wgerId: number, cantidad = 2) => ({
  wgerId,
  dibujos: Array.from({ length: cantidad }, (_, i) => `/medios/ejercicios/wger-${wgerId}-${i + 1}.webp`),
})

/** Por nombre del catálogo (db/ejerciciosBase.ts). Los del catálogo no se pueden renombrar, así que el nombre es estable. */
const CATALOGO: Record<string, MediosEjercicio> = {
  'Press de banca': { musculos: m([4], [2, 5]), ...dibujos(73) },
  'Press de banca con mancuernas': { musculos: m([4], [2, 5]), ...dibujos(75) },
  'Press inclinado con mancuernas': { musculos: m([4, 2], [5]), ...dibujos(537) },
  'Aperturas con mancuernas': { musculos: m([4], [2]) },
  'Cruce de poleas': { musculos: m([4], [2]), ...dibujos(323) },
  'Flexiones de brazos': { musculos: m([4], [2, 5, 6]) },
  'Fondos en paralelas': { musculos: m([4, 5], [2]) },
  Dominadas: { musculos: m([12], [1, 13, 9]) },
  'Jalón al pecho': { musculos: m([12], [1, 13]) },
  'Remo con barra': { musculos: m([12, 9], [1, 13]), ...dibujos(83) },
  'Remo con mancuerna': { musculos: m([12], [1, 9]) },
  'Remo en polea baja': { musculos: m([12, 9], [1]), ...dibujos(394) },
  'Peso muerto': { musculos: m([11, 8], [9, 10, 12]) },
  Sentadilla: { musculos: m([10, 8], [11]) },
  'Prensa de piernas': { musculos: m([10], [8, 11]) },
  Zancadas: { musculos: m([10, 8], [11]), ...dibujos(206) },
  'Sentadilla búlgara': { musculos: m([10, 8], [11]) },
  'Peso muerto rumano': { musculos: m([11, 8]) },
  'Extensión de cuádriceps': { musculos: m([10]) },
  'Curl femoral': { musculos: m([11], [7]), ...dibujos(365) },
  'Hip thrust': { musculos: m([8], [11]) },
  'Elevación de pantorrillas': { musculos: m([7, 15]) },
  'Press militar': { musculos: m([2], [5, 9]), ...dibujos(566) },
  'Press de hombros con mancuernas': { musculos: m([2], [5, 9]), ...dibujos(567) },
  'Elevaciones laterales': { musculos: m([2], [9]), ...dibujos(348) },
  Pájaros: { musculos: m([9], [12]) },
  'Face pull': { musculos: m([9], [12]) },
  'Curl con barra': { musculos: m([1], [13]), ...dibujos(91) },
  'Curl con mancuernas': { musculos: m([1], [13]), ...dibujos(92) },
  'Curl martillo': { musculos: m([13, 1]), ...dibujos(272) },
  'Curl predicador': { musculos: m([1], [13]), ...dibujos(465) },
  'Curl en polea': { musculos: m([1], [13]), ...dibujos(95) },
  'Extensión de tríceps en polea': { musculos: m([5]) },
  'Press francés': { musculos: m([5]), ...dibujos(246) },
  'Extensión de tríceps sobre la cabeza': { musculos: m([5]) },
  'Fondos en banco': { musculos: m([5], [4, 2]), ...dibujos(197) },
  'Press de banca agarre cerrado': { musculos: m([5, 4], [2]), ...dibujos(76) },
  Plancha: { musculos: m([6], [14]) },
  Abdominales: { musculos: m([6], [14]), ...dibujos(167, 1) },
  'Elevación de piernas colgado': { musculos: m([6], [14]) },
  'Rueda abdominal': { musculos: m([6], [14, 12]) },
  'Pallof press': { musculos: m([14], [6]) },
}

export function mediosDe(ejercicio: Pick<Exercise, 'nombre' | 'grupoMuscular' | 'propio'>): MediosEjercicio {
  const delCatalogo = ejercicio.propio ? undefined : CATALOGO[ejercicio.nombre]
  return delCatalogo ?? { musculos: POR_GRUPO[ejercicio.grupoMuscular] }
}
