import type { Experiencia, Lesion, Lugar, Objetivo, Sexo, Zona } from '../types'

/** Textos de las opciones de la evaluación (también se usan para mostrar el perfil). */
export const OBJETIVOS: { valor: Objetivo; etiqueta: string; detalle: string }[] = [
  { valor: 'musculo', etiqueta: 'Ganar músculo', detalle: 'Aumentar masa muscular y verte más definido.' },
  { valor: 'grasa', etiqueta: 'Bajar grasa', detalle: 'Perder peso manteniendo el músculo.' },
  { valor: 'fuerza', etiqueta: 'Ganar fuerza', detalle: 'Levantar más peso en los ejercicios principales.' },
  { valor: 'condicion', etiqueta: 'Mejorar mi condición', detalle: 'Sentirte mejor, con más energía y salud.' },
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
  { valor: 'casa', etiqueta: 'En la casa', detalle: 'Con mancuernas o con el peso del cuerpo.' },
]

export const LESIONES: { valor: Lesion; etiqueta: string }[] = [
  { valor: 'rodillas', etiqueta: 'Rodillas' },
  { valor: 'espalda', etiqueta: 'Espalda baja' },
  { valor: 'hombros', etiqueta: 'Hombros' },
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

export function etiqueta<T extends string>(lista: { valor: T; etiqueta: string }[], valor: T): string {
  return lista.find((x) => x.valor === valor)?.etiqueta ?? valor
}
