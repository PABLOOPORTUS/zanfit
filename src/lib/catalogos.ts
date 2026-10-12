import type { Equipo, GrupoMuscular } from '../types'

export const GRUPOS_MUSCULARES: { valor: GrupoMuscular; etiqueta: string }[] = [
  { valor: 'pecho', etiqueta: 'Pecho' },
  { valor: 'espalda', etiqueta: 'Espalda' },
  { valor: 'piernas', etiqueta: 'Piernas' },
  { valor: 'hombros', etiqueta: 'Hombros' },
  { valor: 'biceps', etiqueta: 'Bíceps' },
  { valor: 'triceps', etiqueta: 'Tríceps' },
  { valor: 'core', etiqueta: 'Core' },
]

export const EQUIPOS: { valor: Equipo; etiqueta: string }[] = [
  { valor: 'barra', etiqueta: 'Barra' },
  { valor: 'mancuernas', etiqueta: 'Mancuernas' },
  { valor: 'maquina', etiqueta: 'Máquina' },
  { valor: 'polea', etiqueta: 'Polea' },
  { valor: 'peso-corporal', etiqueta: 'Peso corporal' },
  { valor: 'kettlebell', etiqueta: 'Kettlebell' },
  { valor: 'banda', etiqueta: 'Banda elástica' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export function etiquetaGrupo(grupo: GrupoMuscular): string {
  return GRUPOS_MUSCULARES.find((g) => g.valor === grupo)?.etiqueta ?? grupo
}

export function etiquetaEquipo(equipo: Equipo): string {
  return EQUIPOS.find((e) => e.valor === equipo)?.etiqueta ?? equipo
}

export function esGrupoMuscular(valor: string | null): valor is GrupoMuscular {
  return GRUPOS_MUSCULARES.some((g) => g.valor === valor)
}
