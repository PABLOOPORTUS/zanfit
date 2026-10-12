import type { Muscle } from 'react-body-highlighter'
import type { GrupoMuscular } from '../types'

/** Músculos según free-exercise-db (con nombre en español) y las zonas que pinta react-body-highlighter. */
export const MUSCULOS = {
  pectorales: { nombre: 'Pectorales', zonas: ['chest'] },
  hombros: { nombre: 'Hombros', zonas: ['front-deltoids', 'back-deltoids'] },
  biceps: { nombre: 'Bíceps', zonas: ['biceps'] },
  triceps: { nombre: 'Tríceps', zonas: ['triceps'] },
  antebrazos: { nombre: 'Antebrazos', zonas: ['forearm'] },
  dorsales: { nombre: 'Dorsales', zonas: ['upper-back'] },
  'espalda-media': { nombre: 'Espalda media', zonas: ['upper-back'] },
  lumbares: { nombre: 'Zona lumbar', zonas: ['lower-back'] },
  trapecios: { nombre: 'Trapecios', zonas: ['trapezius'] },
  cuello: { nombre: 'Cuello', zonas: ['neck'] },
  abdominales: { nombre: 'Abdominales', zonas: ['abs', 'obliques'] },
  gluteos: { nombre: 'Glúteos', zonas: ['gluteal'] },
  cuadriceps: { nombre: 'Cuádriceps', zonas: ['quadriceps'] },
  isquiotibiales: { nombre: 'Isquiotibiales', zonas: ['hamstring'] },
  aductores: { nombre: 'Aductores', zonas: ['adductor'] },
  abductores: { nombre: 'Abductores', zonas: ['abductors'] },
  pantorrillas: { nombre: 'Pantorrillas', zonas: ['calves', 'left-soleus', 'right-soleus'] },
} satisfies Record<string, { nombre: string; zonas: Muscle[] }>

export type Musculo = keyof typeof MUSCULOS

export interface Musculos {
  principales: Musculo[]
  secundarios: Musculo[]
}

export const nombresMusculos = (lista: Musculo[]) => lista.map((m) => MUSCULOS[m].nombre).join(', ')

/** Para ejercicios propios: los músculos típicos de su grupo. */
export const MUSCULOS_POR_GRUPO: Record<GrupoMuscular, Musculos> = {
  pecho: { principales: ['pectorales'], secundarios: ['hombros', 'triceps'] },
  espalda: { principales: ['dorsales'], secundarios: ['biceps', 'espalda-media'] },
  piernas: { principales: ['cuadriceps', 'gluteos'], secundarios: ['isquiotibiales'] },
  hombros: { principales: ['hombros'], secundarios: ['trapecios'] },
  biceps: { principales: ['biceps'], secundarios: ['antebrazos'] },
  triceps: { principales: ['triceps'], secundarios: [] },
  antebrazos: { principales: ['antebrazos'], secundarios: [] },
  core: { principales: ['abdominales'], secundarios: ['lumbares'] },
}

export const NIVELES = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' } as const
export type Nivel = keyof typeof NIVELES

export const CATEGORIAS = {
  fuerza: 'Fuerza',
  estiramiento: 'Estiramiento',
  pliometria: 'Pliometría',
  cardio: 'Cardio',
  powerlifting: 'Powerlifting',
  halterofilia: 'Halterofilia',
  strongman: 'Strongman',
} as const
export type Categoria = keyof typeof CATEGORIAS

export const MECANICAS = { compuesto: 'Compuesto (varias articulaciones)', aislamiento: 'Aislamiento (una articulación)' } as const
export type Mecanica = keyof typeof MECANICAS

export type Fuerza = 'empuje' | 'tiron' | 'estatico'

/** Equipamiento con el detalle de free-exercise-db (más fino que `Equipo`: distingue la barra Z o "sin equipamiento"). */
export const EQUIPAMIENTOS = {
  ninguno: 'Sin equipamiento',
  'peso-corporal': 'Peso corporal',
  barra: 'Barra',
  'barra-z': 'Barra Z',
  mancuernas: 'Mancuernas',
  kettlebell: 'Kettlebell',
  maquina: 'Máquina',
  polea: 'Polea',
  banda: 'Banda elástica',
  'balon-medicinal': 'Balón medicinal',
  fitball: 'Fitball',
  rodillo: 'Rodillo de espuma',
  otro: 'Otro',
} as const
export type Equipamiento = keyof typeof EQUIPAMIENTOS
