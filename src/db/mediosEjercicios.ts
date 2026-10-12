import type { Exercise, GrupoMuscular } from '../types'
import { FOTOS, type FotoEjercicio } from './fotosEjercicios'

/**
 * Recursos gráficos del catálogo (archivos en public/medios). Solo se usan recursos con licencia verificada
 * (ver la pantalla Créditos y CLAUDE.md):
 * - Diagramas de músculos: «Muscular system» de Termininja (Wikimedia Commons), adaptados por wger. CC BY-SA 3.0.
 *   En ZANFIT se recolorearon (lima) y se optimizaron.
 * - Dibujos: Everkinetic (github.com/everkinetic/data), CC BY-SA 4.0, en SVG recoloreados para el modo oscuro
 *   (`ek-<id>-inicio|final.svg`). Dos vienen de la copia de Everkinetic en wger (CC BY-SA 3.0), en WebP, porque
 *   faltan en el repositorio original (`wger-<id>-1|2.webp`); esos se muestran con `invert`.
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

export interface Dibujos {
  /** Posición inicial y final. */
  archivos: string[]
  /** Los WebP vienen con fondo blanco y se invierten en pantalla; los SVG ya vienen recoloreados. */
  invertir: boolean
}

interface MediosEjercicio {
  musculos: Musculos
  dibujos?: Dibujos
  /** Foto real de la máquina o del ejercicio (Wikimedia Commons). */
  foto?: FotoEjercicio
}

const m = (principales: number[], secundarios: number[] = []): Musculos => ({ principales, secundarios })
/** Dibujos de Everkinetic en SVG (id de 4 dígitos del repositorio everkinetic/data). */
const ek = (id: string): { dibujos: Dibujos } => ({
  dibujos: { archivos: [`/medios/ejercicios/ek-${id}-inicio.svg`, `/medios/ejercicios/ek-${id}-final.svg`], invertir: false },
})
/** Copia de Everkinetic en wger (id de ejercicio de wger), solo cuando falta en el repositorio original. */
const wger = (id: number): { dibujos: Dibujos } => ({
  dibujos: { archivos: [`/medios/ejercicios/wger-${id}-1.webp`, `/medios/ejercicios/wger-${id}-2.webp`], invertir: true },
})

/** Por nombre del catálogo (db/ejerciciosBase.ts). Los del catálogo no se pueden renombrar, así que el nombre es estable. */
const CATALOGO: Record<string, MediosEjercicio> = {
  // Pecho
  'Press de banca': { musculos: m([4], [2, 5]), ...ek('0042') },
  'Press de banca con mancuernas': { musculos: m([4], [2, 5]), ...ek('0055') },
  'Press inclinado con mancuernas': { musculos: m([4, 2], [5]), ...ek('0061') },
  'Aperturas con mancuernas': { musculos: m([4], [2]), ...ek('0056') },
  'Cruce de poleas': { musculos: m([4], [2]), ...ek('0048') },
  'Flexiones de brazos': { musculos: m([4], [2, 5, 6]), ...ek('0077') },
  'Fondos en paralelas': { musculos: m([4, 5], [2]), ...ek('0054') },
  'Press de pecho en máquina': { musculos: m([4], [2, 5]), ...ek('0066') },
  'Press inclinado en máquina': { musculos: m([4, 2], [5]) },
  'Press declinado en máquina': { musculos: m([4], [2, 5]), ...ek('0085') },
  'Aperturas en máquina': { musculos: m([4], [2]) },
  'Press de banca en máquina Smith': { musculos: m([4], [2, 5]), ...ek('0078') },
  'Press inclinado en máquina Smith': { musculos: m([4, 2], [5]), ...ek('0081') },
  'Aperturas en polea': { musculos: m([4], [2]), ...ek('0057') },
  'Aperturas inclinadas en polea': { musculos: m([4, 2]), ...ek('0060') },
  // Espalda
  Dominadas: { musculos: m([12], [1, 13, 9]), ...ek('0087') },
  'Jalón al pecho': { musculos: m([12], [1, 13]) },
  'Remo con barra': { musculos: m([12, 9], [1, 13]), ...wger(83) },
  'Remo con mancuerna': { musculos: m([12], [1, 9]) },
  'Remo en polea baja': { musculos: m([12, 9], [1]), ...ek('0025') },
  'Peso muerto': { musculos: m([11, 8], [9, 10, 12]), ...ek('0099') },
  'Jalón con agarre supino': { musculos: m([12], [1, 13]), ...ek('0093') },
  'Jalón con triángulo': { musculos: m([12], [1, 13]), ...ek('0096') },
  'Pullover en polea alta': { musculos: m([12], [5]), ...ek('0092') },
  'Remo en T': { musculos: m([12, 9], [1]), ...ek('0029') },
  Hiperextensiones: { musculos: m([11, 8]), ...ek('0103') },
  'Peso muerto en máquina Smith': { musculos: m([11, 8], [9, 10]), ...ek('0100') },
  // Piernas
  Sentadilla: { musculos: m([10, 8], [11]) },
  'Prensa de piernas': { musculos: m([10], [8, 11]), ...ek('0127') },
  Zancadas: { musculos: m([10, 8], [11]), ...ek('0115') },
  'Sentadilla búlgara': { musculos: m([10, 8], [11]) },
  'Peso muerto rumano': { musculos: m([11, 8]), ...ek('0118') },
  'Extensión de cuádriceps': { musculos: m([10]), ...ek('0142') },
  'Curl femoral': { musculos: m([11], [7]), ...ek('0117') },
  'Hip thrust': { musculos: m([8], [11]) },
  'Elevación de pantorrillas': { musculos: m([7, 15]), ...ek('0282') },
  'Sentadilla hack': { musculos: m([10], [8, 11]), ...ek('0123') },
  'Sentadilla en máquina Smith': { musculos: m([10, 8], [11]), ...ek('0124') },
  'Curl femoral sentado': { musculos: m([11], [7]), ...ek('0119') },
  'Curl femoral de pie': { musculos: m([11], [7]), ...ek('0120') },
  'Abductores en máquina': { musculos: m([8]), ...ek('0156') },
  'Patada de glúteo en polea': { musculos: m([8], [11]), ...ek('0112') },
  'Pantorrillas sentado en máquina': { musculos: m([15], [7]), ...ek('0279') },
  'Pantorrillas en prensa': { musculos: m([7, 15]), ...ek('0273') },
  // Hombros
  'Press militar': { musculos: m([2], [5, 9]) },
  'Press de hombros con mancuernas': { musculos: m([2], [5, 9]), ...wger(567) },
  'Elevaciones laterales': { musculos: m([2], [9]), ...ek('0018') },
  Pájaros: { musculos: m([9], [12]) },
  'Face pull': { musculos: m([9], [12]) },
  'Press de hombros en máquina': { musculos: m([2], [5]) },
  'Elevaciones frontales en polea': { musculos: m([2], [4]), ...ek('0008') },
  'Remo al mentón en polea': { musculos: m([2, 9], [1]), ...ek('0015') },
  'Remo al mentón en máquina Smith': { musculos: m([2, 9], [1]), ...ek('0013') },
  'Pájaros en polea': { musculos: m([9], [12]), ...ek('0017') },
  'Encogimientos en polea': { musculos: m([9]), ...ek('0009') },
  'Encogimientos en máquina Smith': { musculos: m([9]), ...ek('0041') },
  // Bíceps
  'Curl con barra': { musculos: m([1], [13]), ...ek('0211') },
  'Curl con mancuernas': { musculos: m([1], [13]), ...ek('0224') },
  'Curl martillo': { musculos: m([13, 1]), ...ek('0227') },
  'Curl predicador': { musculos: m([1], [13]), ...ek('0239') },
  'Curl en polea': { musculos: m([1], [13]), ...ek('0212') },
  'Curl predicador en máquina': { musculos: m([1], [13]), ...ek('0236') },
  'Curl martillo en polea': { musculos: m([13, 1]), ...ek('0216') },
  'Curl predicador en polea': { musculos: m([1], [13]), ...ek('0217') },
  // Tríceps
  'Extensión de tríceps en polea': { musculos: m([5]), ...ek('0205') },
  'Press francés': { musculos: m([5]), ...ek('0183') },
  'Extensión de tríceps sobre la cabeza': { musculos: m([5]) },
  'Fondos en banco': { musculos: m([5], [4, 2]), ...ek('0162') },
  'Press de banca agarre cerrado': { musculos: m([5, 4], [2]), ...ek('0049') },
  'Extensión de tríceps con cuerda': { musculos: m([5]), ...ek('0206') },
  'Extensión de tríceps con agarre invertido': { musculos: m([5]), ...ek('0189') },
  'Extensión de tríceps a una mano en polea': { musculos: m([5]), ...ek('0166') },
  'Fondos en máquina': { musculos: m([5], [4, 2]), ...ek('0171') },
  'Extensión de tríceps en máquina': { musculos: m([5]), ...ek('0210') },
  // Core
  Plancha: { musculos: m([6], [14]) },
  Abdominales: { musculos: m([6], [14]), ...ek('0291') },
  'Elevación de piernas colgado': { musculos: m([6], [14]) },
  'Rueda abdominal': { musculos: m([6], [14, 12]) },
  'Pallof press': { musculos: m([14], [6]) },
  'Crunch en polea': { musculos: m([6], [14]), ...ek('0288') },
}

export function mediosDe(ejercicio: Pick<Exercise, 'nombre' | 'grupoMuscular' | 'propio'>): MediosEjercicio {
  const delCatalogo = ejercicio.propio ? undefined : CATALOGO[ejercicio.nombre]
  if (!delCatalogo) return { musculos: POR_GRUPO[ejercicio.grupoMuscular] }
  return { ...delCatalogo, foto: FOTOS[ejercicio.nombre] }
}
