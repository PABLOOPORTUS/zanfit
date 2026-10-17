import { FICHAS, type Ficha } from '../db/fichasEjercicios'
import { CLASIFICACION, type Clasificacion, type Patron } from '../db/patronesEjercicios'
import type { Exercise, Lesion } from '../types'

/**
 * Clasificación de un ejercicio para el generador de planes: patrón de movimiento, nivel técnico (1–3) y zonas que
 * exige. Los 79 básicos están clasificados a mano (db/patronesEjercicios.ts); el resto del catálogo se clasifica con
 * reglas a partir de su ficha de free-exercise-db (músculo principal, mecánica, tipo de fuerza y palabras del id en
 * inglés, que es más regular que el nombre traducido). Devuelve `undefined` si el ejercicio no sirve para el plan.
 */
export function clasificar(ejercicio: Pick<Exercise, 'nombre' | 'propio'>): Clasificacion | undefined {
  if (ejercicio.propio) return undefined
  const manual = CLASIFICACION[ejercicio.nombre]
  if (manual) return manual
  const ficha = FICHAS[ejercicio.nombre]
  return ficha && clasificarFicha(ficha)
}

/** Necesita una barra fija o paralelas (en la casa o al aire libre, solo si el usuario las tiene). */
export function necesitaBarras(ejercicio: Pick<Exercise, 'nombre'>): boolean {
  const id = FICHAS[ejercicio.nombre]?.id ?? ''
  return /pull-?ups?|chin-?ups?|hanging|muscle.?up|^dips|parallel_bar|inverted_row|toes_to_bar/i.test(id)
}

/** Aunque sea con el peso del cuerpo, necesita un aparato de gimnasio (banco de hiperextensiones, trineo, landmine…). */
export function necesitaGimnasio(ejercicio: Pick<Exercise, 'nombre'>): boolean {
  const id = FICHAS[ejercicio.nombre]?.id ?? ''
  return /hyperextension|glute_ham|sled|landmine|t-bar|reverse_hyper/i.test(id)
}

function clasificarFicha(f: Ficha): Clasificacion | undefined {
  // Solo ejercicios de fuerza con carga o con el cuerpo: los estiramientos, el cardio, la pliometría, la halterofilia y
  // el strongman no entran al plan (los estiramientos y el cardio se usan en el calentamiento).
  if (f.categoria !== 'fuerza' && f.categoria !== 'powerlifting') return undefined
  if (f.fuerza === 'estatico' || f.equipamiento === 'otro' || f.equipamiento === 'rodillo') return undefined
  const patron = patronDe(f)
  if (!patron) return undefined
  const nivel = Math.max({ principiante: 1, intermedio: 2, avanzado: 3 }[f.nivel], f.categoria === 'powerlifting' ? 2 : 1) as 1 | 2 | 3
  return { patron, nivel, riesgos: riesgosDe(f, patron) }
}

function patronDe(f: Ficha): Patron | undefined {
  const id = f.id
  const compuesto = f.mecanica === 'compuesto'
  // Movimientos que free-exercise-db marca con un músculo o una mecánica que confunde al generador.
  if (/flutter|scissor/i.test(id)) return 'core'
  if (/clean|snatch|jerk|hip_flexion|knee_raise|around_the_world|wiper/i.test(id)) return undefined
  if (/pullover/i.test(id)) return 'espalda-aisl'
  // Los pesos muertos son bisagra aunque la ficha ponga los cuádriceps como músculo principal.
  if (/deadlift/i.test(id) && f.principales[0] === 'cuadriceps') return 'bisagra'
  if (/shoulder_raise|pirate_ship/i.test(id)) return 'hombro-aisl'
  switch (f.principales[0]) {
    case 'pectorales':
      return compuesto && !/fly|flye|cross.?over/i.test(id) ? 'empuje-h' : 'pecho-aisl'
    case 'hombros':
      if (/rear|reverse|face_pull|bent.?over/i.test(id)) return 'hombro-post'
      return compuesto && f.fuerza !== 'tiron' ? 'empuje-v' : 'hombro-aisl'
    case 'dorsales':
      if (/pull-?up|chin|pulldown|muscle.?up/i.test(id)) return 'tiron-v'
      return compuesto ? 'tiron-h' : 'espalda-aisl'
    case 'espalda-media':
      return compuesto || f.fuerza === 'tiron' ? 'tiron-h' : 'hombro-post'
    case 'trapecios':
      return 'trapecio'
    case 'lumbares':
      return 'bisagra'
    case 'cuadriceps':
      return compuesto ? 'sentadilla' : 'cuadriceps-aisl'
    case 'isquiotibiales':
      return compuesto ? 'bisagra' : 'isquio-aisl'
    case 'gluteos':
      if (!compuesto) return 'gluteo-aisl'
      return /squat|lunge|step.?up|split/i.test(id) ? 'sentadilla' : 'bisagra'
    case 'aductores':
    case 'abductores':
      return 'gluteo-aisl'
    case 'pantorrillas':
      return 'pantorrilla'
    case 'biceps':
      return 'biceps'
    case 'triceps':
      return 'triceps'
    case 'abdominales':
      return 'core'
    default:
      return undefined // antebrazos y cuello: no tienen hueco en el plan
  }
}

function riesgosDe(f: Ficha, patron: Patron): Lesion[] {
  const id = f.id
  const riesgos: Lesion[] = []
  const caderaSinCarga = /bridge|thrust|kickback|pull.?through/i.test(id)
  if (patron === 'empuje-v' || /dip|upright|behind.?(the.?)?neck|handstand|overhead|snatch|jerk|guillotine/i.test(id)) riesgos.push('hombros')
  if (patron === 'empuje-h' && f.equipamiento === 'barra') riesgos.push('hombros')
  if ((patron === 'sentadilla' && !caderaSinCarga) || patron === 'cuadriceps-aisl' || /lunge|squat|jump|step.?up|pistol|sissy/i.test(id)) riesgos.push('rodillas')
  if (
    (patron === 'bisagra' && !caderaSinCarga) ||
    /deadlift|good.?morning/i.test(id) ||
    (patron === 'tiron-h' && f.equipamiento === 'barra') ||
    f.principales.includes('lumbares')
  )
    riesgos.push('espalda')
  if (/push.?ups?|pushups|front.?squat|clean|snatch|wrist|handstand|dip|plank/i.test(id)) riesgos.push('munecas')
  return [...new Set(riesgos)]
}
