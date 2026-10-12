import type { EquipoDisponible, Experiencia, Lesion, Lugar, Objetivo, Sexo, Zona } from '../types'

const TODOS_LOS_PASOS = ['inicio', 'sexo', 'datos', 'objetivo', 'zonas', 'experiencia', 'lugar', 'equipo', 'frecuencia', 'lesiones', 'salud'] as const
export type Paso = (typeof TODOS_LOS_PASOS)[number]
/** Pasos de la evaluación (`/evaluacion?paso=N`). El de equipo solo aparece si no entrena en el gimnasio. */
export const pasosPara = (lugar: Lugar | null): Paso[] => TODOS_LOS_PASOS.filter((p) => p !== 'equipo' || (lugar !== null && lugar !== 'gimnasio'))

/** Textos de las opciones de la evaluación (también se usan para mostrar el perfil). */
export const OBJETIVOS: { valor: Objetivo; etiqueta: string; detalle: string }[] = [
  { valor: 'musculo', etiqueta: 'Ganar músculo', detalle: 'Aumentar masa muscular y verte más definido.' },
  { valor: 'grasa', etiqueta: 'Bajar grasa', detalle: 'Perder peso manteniendo el músculo.' },
  { valor: 'fuerza', etiqueta: 'Ganar fuerza', detalle: 'Levantar más peso en los ejercicios principales.' },
  { valor: 'resistencia', etiqueta: 'Mejorar mi resistencia', detalle: 'Aguantar más: más repeticiones, menos descanso y mejor estado físico.' },
  { valor: 'condicion', etiqueta: 'Salud general', detalle: 'Sentirte mejor, con más energía, movilidad y salud.' },
]

export const ZONAS: { valor: Zona; etiqueta: string }[] = [
  { valor: 'general', etiqueta: 'Todo el cuerpo' },
  { valor: 'piernas-gluteos', etiqueta: 'Piernas y glúteos' },
  { valor: 'abdomen', etiqueta: 'Abdomen' },
  { valor: 'brazos', etiqueta: 'Brazos' },
  { valor: 'pecho', etiqueta: 'Pecho' },
  { valor: 'espalda', etiqueta: 'Espalda' },
  { valor: 'hombros', etiqueta: 'Hombros' },
]

export const EXPERIENCIAS: { valor: Experiencia; etiqueta: string; detalle: string }[] = [
  { valor: 'principiante', etiqueta: 'Principiante', detalle: 'Nunca he entrenado o llevo menos de 6 meses.' },
  { valor: 'intermedio', etiqueta: 'Intermedio', detalle: 'Entreno hace entre 6 meses y 2 años.' },
  { valor: 'avanzado', etiqueta: 'Avanzado', detalle: 'Entreno hace más de 2 años y conozco la técnica.' },
]

export const LUGARES: { valor: Lugar; etiqueta: string; detalle: string }[] = [
  { valor: 'gimnasio', etiqueta: 'En el gimnasio', detalle: 'Con máquinas, poleas, barras y mancuernas.' },
  { valor: 'casa', etiqueta: 'En la casa', detalle: 'Con lo que tengas: mancuernas, bandas o solo tu cuerpo.' },
  { valor: 'aire-libre', etiqueta: 'Al aire libre', detalle: 'En una plaza, parque o calistenia, con barras o sin nada.' },
]

export const EQUIPOS_DISPONIBLES: { valor: EquipoDisponible; etiqueta: string; detalle?: string }[] = [
  { valor: 'mancuernas', etiqueta: 'Mancuernas' },
  { valor: 'kettlebell', etiqueta: 'Kettlebell' },
  { valor: 'banda', etiqueta: 'Bandas elásticas' },
  { valor: 'barras-dominadas', etiqueta: 'Barra de dominadas o paralelas', detalle: 'En la casa o en una plaza de ejercicios.' },
  { valor: 'barra', etiqueta: 'Barra con discos' },
  { valor: 'fitball', etiqueta: 'Fitball' },
  { valor: 'balon-medicinal', etiqueta: 'Balón medicinal' },
]

/** Perfiles antiguos de "casa" no tenían esta respuesta: se asume lo que el plan usaba antes. */
export const EQUIPAMIENTO_POR_DEFECTO: EquipoDisponible[] = ['mancuernas', 'banda', 'kettlebell']

export const LESIONES: { valor: Lesion; etiqueta: string }[] = [
  { valor: 'rodillas', etiqueta: 'Rodillas' },
  { valor: 'espalda', etiqueta: 'Espalda baja' },
  { valor: 'hombros', etiqueta: 'Hombros' },
  { valor: 'munecas', etiqueta: 'Muñecas' },
]

export const SEXOS: { valor: Sexo; etiqueta: string }[] = [
  { valor: 'hombre', etiqueta: 'Hombre' },
  { valor: 'mujer', etiqueta: 'Mujer' },
]

/** Preguntas de salud previas al ejercicio (adaptadas del cuestionario PAR-Q). Un "sí" activa la precaución. */
export function preguntasSalud(sexo: Sexo | null): string[] {
  return [
    '¿Algún médico te ha dicho que tienes un problema al corazón o presión alta?',
    '¿Sientes dolor en el pecho al hacer actividad física?',
    '¿Te has mareado hasta perder el equilibrio o te has desmayado en el último año?',
    '¿Tienes alguna enfermedad crónica diagnosticada (por ejemplo, diabetes) o tomas remedios para el corazón o la presión?',
    ...(sexo === 'mujer' ? ['¿Estás embarazada o tuviste un parto en los últimos 6 meses?'] : []),
  ]
}

/** Aviso que se muestra al empezar la evaluación y en el plan. */
export const AVISO_SALUD =
  'Este plan es una guía general y no reemplaza la evaluación de un médico, kinesiólogo o profesor de educación física. Si sientes dolor, mareo o falta de aire, detente.'

export function etiqueta<T extends string>(lista: { valor: T; etiqueta: string }[], valor: T): string {
  return lista.find((x) => x.valor === valor)?.etiqueta ?? valor
}
