import type { RoutineExercise } from '../types'

type EjercicioBase = Omit<RoutineExercise, 'exerciseId'> & { nombre: string }

/** Rutinas de ejemplo. Los ejercicios se buscan por nombre en el catálogo inicial (db/ejerciciosBase.ts). */
export const RUTINAS_BASE: { nombre: string; ejercicios: EjercicioBase[] }[] = [
  {
    nombre: 'Push',
    ejercicios: [
      { nombre: 'Press de banca', seriesObjetivo: 4, repsObjetivo: 8, descansoSeg: 120 },
      { nombre: 'Press inclinado con mancuernas', seriesObjetivo: 3, repsObjetivo: 10, descansoSeg: 90 },
      { nombre: 'Press militar', seriesObjetivo: 3, repsObjetivo: 8, descansoSeg: 120 },
      { nombre: 'Elevaciones laterales', seriesObjetivo: 3, repsObjetivo: 12, descansoSeg: 60 },
      { nombre: 'Extensión de tríceps en polea', seriesObjetivo: 3, repsObjetivo: 12, descansoSeg: 60 },
    ],
  },
  {
    nombre: 'Pull',
    ejercicios: [
      { nombre: 'Dominadas', seriesObjetivo: 4, repsObjetivo: 6, descansoSeg: 120 },
      { nombre: 'Remo con barra', seriesObjetivo: 4, repsObjetivo: 8, descansoSeg: 120 },
      { nombre: 'Jalón al pecho', seriesObjetivo: 3, repsObjetivo: 10, descansoSeg: 90 },
      { nombre: 'Face pull', seriesObjetivo: 3, repsObjetivo: 15, descansoSeg: 60 },
      { nombre: 'Curl con barra', seriesObjetivo: 3, repsObjetivo: 10, descansoSeg: 60 },
      { nombre: 'Curl martillo', seriesObjetivo: 3, repsObjetivo: 12, descansoSeg: 60 },
    ],
  },
  {
    nombre: 'Legs',
    ejercicios: [
      { nombre: 'Sentadilla', seriesObjetivo: 4, repsObjetivo: 6, descansoSeg: 180 },
      { nombre: 'Peso muerto rumano', seriesObjetivo: 3, repsObjetivo: 8, descansoSeg: 120 },
      { nombre: 'Prensa de piernas', seriesObjetivo: 3, repsObjetivo: 10, descansoSeg: 120 },
      { nombre: 'Curl femoral', seriesObjetivo: 3, repsObjetivo: 12, descansoSeg: 60 },
      { nombre: 'Hip thrust', seriesObjetivo: 3, repsObjetivo: 10, descansoSeg: 90 },
      { nombre: 'Elevación de pantorrillas', seriesObjetivo: 4, repsObjetivo: 12, descansoSeg: 60 },
    ],
  },
]
