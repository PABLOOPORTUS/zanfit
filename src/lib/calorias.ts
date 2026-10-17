import { FICHAS } from '../db/fichasEjercicios'
import { PATRONES_COMPUESTOS } from '../db/patronesEjercicios'
import { camposCardio, metTrotadora } from './cardio'
import { clasificar } from './clasificacion'
import type { ResumenEntreno } from '../db/progreso'
import type { Exercise, PasoCalentamiento, RoutineExercise, WorkoutSet } from '../types'

/**
 * Calorías estimadas con el método MET (Compendium of Physical Activities): kcal = MET × peso (kg) × horas.
 * Es una aproximación: depende de la intensidad real, del descanso y de cada persona (los relojes también estiman).
 * MET de referencia: pesas con esfuerzo moderado 3,5; ejercicios compuestos con esfuerzo vigoroso 5–6; calistenia 3,8;
 * estiramientos 2,3; pliometría 8; cardio según la máquina.
 */

/** Peso que se usa si no hay evaluación (se avisa como "aprox."). */
export const PESO_POR_DEFECTO = 70

const CARDIO: [RegExp, number][] = [
  [/cuerda/i, 11],
  [/sprint|trineo/i, 9],
  [/escaladora|step/i, 9],
  [/trote|trotar/i, 8],
  [/remo/i, 7],
  [/bicicleta/i, 6.8],
  [/patinaje/i, 7],
  [/el[ií]ptica/i, 5],
  [/caminata/i, 4.3],
]

export function metDe(ejercicio: Pick<Exercise, 'nombre' | 'propio' | 'equipo'>): number {
  const ficha = ejercicio.propio ? undefined : FICHAS[ejercicio.nombre]
  switch (ficha?.categoria) {
    case 'cardio':
      return CARDIO.find(([re]) => re.test(ejercicio.nombre))?.[1] ?? 7
    case 'estiramiento':
      return 2.3
    case 'pliometria':
      return 8
    case 'halterofilia':
    case 'strongman':
      return 6
  }
  const cl = clasificar(ejercicio)
  const compuesto = cl ? PATRONES_COMPUESTOS.includes(cl.patron) : ficha?.mecanica === 'compuesto'
  if (ejercicio.equipo === 'peso-corporal') return compuesto ? 4.5 : 3.8
  return compuesto ? 5 : 3.5
}

/** MET promedio ponderado por la cantidad de series (o de tiempo) de cada ejercicio. */
function metPromedio(partes: { met: number; peso: number }[]): number {
  const total = partes.reduce((s, p) => s + p.peso, 0)
  return total === 0 ? 3.5 : partes.reduce((s, p) => s + p.met * p.peso, 0) / total
}

const redondear = (kcal: number) => Math.max(5, Math.round(kcal / 5) * 5)

/** MET de un tramo de cardio: en la trotadora, con su velocidad e inclinación (ACSM); si no, el de la máquina. */
function metTramo(ejercicio: Exercise, serie: WorkoutSet): number {
  return serie.velocidad && camposCardio(ejercicio)?.includes('velocidad') ? metTrotadora(serie.velocidad, serie.inclinacion) : metDe(ejercicio)
}

/**
 * Calorías de un entreno terminado: duración real (entre 5 min y 3 h, por si quedó abierto) × MET promedio de lo que
 * se hizo, según las series completadas de cada ejercicio. El cardio con minutos anotados se calcula aparte, con su
 * tiempo y su intensidad reales, y el resto del entreno ocupa el tiempo que queda.
 */
export function caloriasEntreno(
  duracionMs: number,
  seriesPorEjercicio: { ejercicio: Exercise; series: number; sets?: WorkoutSet[] }[],
  pesoKg: number,
): number {
  const horas = Math.min(Math.max(duracionMs / 3_600_000, 5 / 60), 3)
  let kcalCardio = 0
  let horasCardio = 0
  const resto: { met: number; peso: number }[] = []
  for (const x of seriesPorEjercicio) {
    const tramos = camposCardio(x.ejercicio) ? (x.sets ?? []).filter((s) => (s.minutos ?? 0) > 0) : []
    if (tramos.length === 0) resto.push({ met: metDe(x.ejercicio), peso: x.series })
    for (const s of tramos) {
      horasCardio += s.minutos! / 60
      kcalCardio += metTramo(x.ejercicio, s) * pesoKg * (s.minutos! / 60)
    }
  }
  if (horasCardio === 0) return redondear(metPromedio(resto) * pesoKg * horas)
  const horasResto = resto.length ? Math.max(horas - horasCardio, 0) : 0
  return redondear(kcalCardio + metPromedio(resto) * pesoKg * horasResto)
}

/** Calorías estimadas de una rutina, con su duración estimada (minutos) y su calentamiento. */
export function caloriasRutina(
  rutina: { ejercicios: Pick<RoutineExercise, 'exerciseId' | 'seriesObjetivo'>[]; calentamiento?: PasoCalentamiento[] },
  minutos: number,
  porId: Map<number, Exercise>,
  pesoKg: number,
): number {
  const partes = rutina.ejercicios.flatMap((x) => {
    const e = porId.get(x.exerciseId)
    return e ? [{ met: metDe(e), peso: x.seriesObjetivo }] : []
  })
  return redondear(metPromedio(partes) * pesoKg * (minutos / 60))
}

/** Calorías de un entreno ya resumido (con el peso de la evaluación; sin evaluación, 70 kg). */
export function caloriasDeResumen(resumen: Pick<ResumenEntreno, 'duracionMs' | 'bloques'>, pesoKg: number | undefined): number {
  return caloriasEntreno(
    resumen.duracionMs,
    resumen.bloques.map((b) => ({ ejercicio: b.exercise, series: b.sets.length, sets: b.sets })),
    pesoKg ?? PESO_POR_DEFECTO,
  )
}
