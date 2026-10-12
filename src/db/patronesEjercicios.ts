import type { Lesion } from '../types'

/** Patrón de movimiento: el generador de planes arma cada día con "huecos" de estos patrones. */
export type Patron =
  | 'sentadilla' // dominante de rodilla (cuádriceps y glúteos)
  | 'bisagra' // dominante de cadera (isquiotibiales y glúteos)
  | 'empuje-h' // press de pecho
  | 'empuje-v' // press de hombros
  | 'tiron-v' // dominadas y jalones
  | 'tiron-h' // remos
  | 'pecho-aisl'
  | 'espalda-aisl'
  | 'hombro-aisl'
  | 'hombro-post' // deltoides posterior: pájaros, face pull
  | 'trapecio'
  | 'cuadriceps-aisl'
  | 'isquio-aisl'
  | 'gluteo-aisl'
  | 'pantorrilla'
  | 'biceps'
  | 'triceps'
  | 'core'

export const PATRONES_COMPUESTOS: Patron[] = ['sentadilla', 'bisagra', 'empuje-h', 'empuje-v', 'tiron-v', 'tiron-h']

export interface Clasificacion {
  patron: Patron
  /** 1 = fácil de aprender (máquinas), 2 = intermedio, 3 = técnico (barra libre, dominadas). */
  nivel: 1 | 2 | 3
  /** Zonas que el ejercicio exige: si el usuario declaró una lesión ahí, el generador lo evita. */
  riesgos?: Lesion[]
}

const c = (patron: Patron, nivel: 1 | 2 | 3, ...riesgos: Lesion[]): Clasificacion => ({ patron, nivel, riesgos })

/** Por nombre del catálogo (db/ejerciciosBase.ts). Los ejercicios propios no entran al generador. */
export const CLASIFICACION: Record<string, Clasificacion> = {
  // Pecho
  'Press de banca': c('empuje-h', 2, 'hombros'),
  'Press de banca con mancuernas': c('empuje-h', 2),
  'Press inclinado con mancuernas': c('empuje-h', 2),
  'Aperturas con mancuernas': c('pecho-aisl', 2, 'hombros'),
  'Cruce de poleas': c('pecho-aisl', 1),
  'Flexiones de brazos': c('empuje-h', 1),
  'Fondos en paralelas': c('empuje-h', 3, 'hombros'),
  'Press de pecho en máquina': c('empuje-h', 1),
  'Press inclinado en máquina': c('empuje-h', 1),
  'Press declinado en máquina': c('empuje-h', 1),
  'Aperturas en máquina': c('pecho-aisl', 1),
  'Press de banca en máquina Smith': c('empuje-h', 1),
  'Press inclinado en máquina Smith': c('empuje-h', 1),
  'Aperturas en polea': c('pecho-aisl', 1),
  'Aperturas inclinadas en polea': c('pecho-aisl', 1),
  // Espalda
  Dominadas: c('tiron-v', 3, 'hombros'),
  'Jalón al pecho': c('tiron-v', 1),
  'Remo con barra': c('tiron-h', 3, 'espalda'),
  'Remo con mancuerna': c('tiron-h', 2),
  'Remo en polea baja': c('tiron-h', 1),
  'Peso muerto': c('bisagra', 3, 'espalda'),
  'Jalón con agarre supino': c('tiron-v', 1),
  'Jalón con triángulo': c('tiron-v', 1),
  'Pullover en polea alta': c('espalda-aisl', 1),
  'Remo en T': c('tiron-h', 2, 'espalda'),
  Hiperextensiones: c('bisagra', 1, 'espalda'),
  'Peso muerto en máquina Smith': c('bisagra', 2, 'espalda'),
  // Piernas
  Sentadilla: c('sentadilla', 3, 'rodillas', 'espalda'),
  'Prensa de piernas': c('sentadilla', 1),
  Zancadas: c('sentadilla', 2, 'rodillas'),
  'Sentadilla búlgara': c('sentadilla', 2, 'rodillas'),
  'Peso muerto rumano': c('bisagra', 2, 'espalda'),
  'Extensión de cuádriceps': c('cuadriceps-aisl', 1, 'rodillas'),
  'Curl femoral': c('isquio-aisl', 1),
  'Hip thrust': c('bisagra', 2),
  'Elevación de pantorrillas': c('pantorrilla', 1),
  'Sentadilla hack': c('sentadilla', 1, 'rodillas'),
  'Sentadilla en máquina Smith': c('sentadilla', 2, 'rodillas'),
  'Curl femoral sentado': c('isquio-aisl', 1),
  'Curl femoral de pie': c('isquio-aisl', 1),
  'Abductores en máquina': c('gluteo-aisl', 1),
  'Patada de glúteo en polea': c('gluteo-aisl', 1),
  'Pantorrillas sentado en máquina': c('pantorrilla', 1),
  'Pantorrillas en prensa': c('pantorrilla', 1),
  // Hombros
  'Press militar': c('empuje-v', 3, 'hombros', 'espalda'),
  'Press de hombros con mancuernas': c('empuje-v', 2, 'hombros'),
  'Elevaciones laterales': c('hombro-aisl', 1),
  Pájaros: c('hombro-post', 2),
  'Face pull': c('hombro-post', 1),
  'Press de hombros en máquina': c('empuje-v', 1, 'hombros'),
  'Elevaciones frontales en polea': c('hombro-aisl', 1),
  'Remo al mentón en polea': c('hombro-aisl', 2, 'hombros'),
  'Remo al mentón en máquina Smith': c('hombro-aisl', 2, 'hombros'),
  'Pájaros en polea': c('hombro-post', 1),
  'Encogimientos en polea': c('trapecio', 1),
  'Encogimientos en máquina Smith': c('trapecio', 1),
  // Bíceps
  'Curl con barra': c('biceps', 1),
  'Curl con mancuernas': c('biceps', 1),
  'Curl martillo': c('biceps', 1),
  'Curl predicador': c('biceps', 1),
  'Curl en polea': c('biceps', 1),
  'Curl predicador en máquina': c('biceps', 1),
  'Curl martillo en polea': c('biceps', 1),
  'Curl predicador en polea': c('biceps', 1),
  // Tríceps
  'Extensión de tríceps en polea': c('triceps', 1),
  'Press francés': c('triceps', 2),
  'Extensión de tríceps sobre la cabeza': c('triceps', 1, 'hombros'),
  'Fondos en banco': c('triceps', 2, 'hombros'),
  'Press de banca agarre cerrado': c('triceps', 2),
  'Extensión de tríceps con cuerda': c('triceps', 1),
  'Extensión de tríceps con agarre invertido': c('triceps', 1),
  'Extensión de tríceps a una mano en polea': c('triceps', 1),
  'Fondos en máquina': c('triceps', 1),
  'Extensión de tríceps en máquina': c('triceps', 1),
  // Core
  Plancha: c('core', 1),
  Abdominales: c('core', 1),
  'Elevación de piernas colgado': c('core', 3),
  'Rueda abdominal': c('core', 3, 'espalda'),
  'Crunch en polea': c('core', 1),
}
