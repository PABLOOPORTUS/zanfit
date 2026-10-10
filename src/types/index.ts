export type GrupoMuscular =
  | 'pecho'
  | 'espalda'
  | 'piernas'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'cardio'
  | 'otro'

export interface Ejercicio {
  id?: number
  nombre: string
  grupoMuscular: GrupoMuscular
  notas?: string
}

export interface Rutina {
  id?: number
  nombre: string
  ejercicioIds: number[]
  creadaEn: number
}

export interface Serie {
  ejercicioId: number
  repeticiones: number
  pesoKg: number
  completada: boolean
}

export interface Sesion {
  id?: number
  rutinaId?: number
  inicio: number
  fin?: number
  series: Serie[]
}
