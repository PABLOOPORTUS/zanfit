import { EJERCICIOS_BASE } from '../db/ejerciciosBase'
import { FICHAS } from '../db/fichasEjercicios'
import { mediosDe } from '../db/mediosEjercicios'
import { PATRONES_COMPUESTOS, type Patron } from '../db/patronesEjercicios'
import { esCardio, objetivoPorDefecto } from './cardio'
import { clasificar, necesitaBarras, necesitaGimnasio } from './clasificacion'
import { EQUIPAMIENTO_POR_DEFECTO } from './evaluacion'
import type { DiaIa, PedidoIa, Rango } from './planIa'
import type { Division, Equipo, Exercise, Experiencia, Objetivo, PasoCalentamiento, Perfil, RoutineExercise, Zona } from '../types'

/**
 * Generador de planes por reglas (sin IA, funciona offline). Recibe la evaluación y el catálogo y arma los días.
 * Es una función pura: no toca la base de datos (eso lo hace db/plan.ts).
 *
 * Reglas:
 * - División según los días: 2–3 cuerpo completo, 4 torso y pierna, 5 empuje/tirón/pierna + torso y pierna, 6 empuje/tirón/pierna ×2.
 * - Series, reps y descanso según el objetivo (`prescripcion`), con ajustes por experiencia, edad y salud.
 * - Compuestos primero y aislamiento al final; la cantidad de ejercicios se ajusta a los minutos por sesión.
 * - Fuera quedan los ejercicios que cargan zonas lesionadas, los que piden equipo que no tiene y los muy técnicos para su nivel.
 * - En las divisiones por grupos, dos días seguidos no repiten el mismo grupo principal.
 * - Cada día trae un calentamiento: 5 minutos de cardio suave y movilidad de las zonas que se van a trabajar.
 */

export type TipoDia = 'completo' | 'torso' | 'pierna' | 'push' | 'pull'

export interface DiaGenerado {
  nombre: string
  tipo: TipoDia
  foco: string
  /** Nota motivadora del día (solo si lo ajustó la IA). */
  nota?: string
  /** Patrones que buscó el motor, en orden de prioridad (para armar los candidatos de la IA). */
  patrones: Patron[]
  ejercicios: RoutineExercise[]
  calentamiento: PasoCalentamiento[]
}

export interface PlanGenerado {
  division: Division
  dias: DiaGenerado[]
  recomendaciones: string[]
  /** `reglas`: armado solo por el motor; `ia`: la IA eligió y ordenó entre los candidatos de las reglas. */
  origen: 'reglas' | 'ia'
}

export const NOMBRE_TIPO: Record<TipoDia, string> = {
  completo: 'Cuerpo completo',
  torso: 'Torso',
  pierna: 'Pierna',
  push: 'Empuje',
  pull: 'Tirón',
}

export const FOCO_TIPO: Record<TipoDia, string> = {
  completo: 'Todo el cuerpo',
  torso: 'Pecho, espalda, hombros y brazos',
  pierna: 'Piernas, glúteos y abdomen',
  push: 'Pecho, hombros y tríceps',
  pull: 'Espalda y bíceps',
}

/** Grupos principales de cada tipo de día (para no repetirlos en días seguidos). */
export const GRUPOS_TIPO: Record<TipoDia, string[]> = {
  completo: ['pecho', 'espalda', 'piernas', 'hombros'],
  torso: ['pecho', 'espalda', 'hombros', 'brazos'],
  pierna: ['piernas'],
  push: ['pecho', 'hombros', 'triceps'],
  pull: ['espalda', 'biceps'],
}

export const DESCRIPCION_DIVISION: Record<Division, string> = {
  completo: 'Cuerpo completo: cada sesión trabaja todos los grupos musculares. Ideal para pocos días o para partir. Deja un día de descanso entre sesiones.',
  'torso-pierna': 'Torso y pierna: alternas un día de tren superior y uno de tren inferior.',
  ppl: 'Empuje, tirón y pierna: pecho, hombros y tríceps; espalda y bíceps; y piernas, en días separados.',
  'ppl-torso-pierna': 'Empuje, tirón y pierna, más un día de torso y otro de pierna para sumar volumen.',
}

export function edad(perfil: Pick<Perfil, 'anioNacimiento'>, ahora = new Date()): number {
  return ahora.getFullYear() - perfil.anioNacimiento
}

/** Índice de masa corporal con la categoría de la OMS. Solo es una referencia: no distingue músculo de grasa. */
export function imc(perfil: Pick<Perfil, 'pesoKg' | 'alturaCm'>): { valor: number; categoria: string } {
  const valor = perfil.pesoKg / (perfil.alturaCm / 100) ** 2
  const categoria = valor < 18.5 ? 'Bajo peso' : valor < 25 ? 'Peso normal' : valor < 30 ? 'Sobrepeso' : 'Obesidad'
  return { valor: Math.round(valor * 10) / 10, categoria }
}

function division(dias: number): { division: Division; tipos: TipoDia[] } {
  if (dias <= 3) return { division: 'completo', tipos: Array<TipoDia>(Math.max(dias, 2)).fill('completo') }
  if (dias === 4) return { division: 'torso-pierna', tipos: ['torso', 'pierna', 'torso', 'pierna'] }
  if (dias === 5) return { division: 'ppl-torso-pierna', tipos: ['push', 'pull', 'pierna', 'torso', 'pierna'] }
  return { division: 'ppl', tipos: ['push', 'pull', 'pierna', 'push', 'pull', 'pierna'] }
}

/** Huecos de cada tipo de día, en orden de prioridad (si falta tiempo, se cortan los últimos). */
function huecos(tipo: TipoDia, variante: number): Patron[] {
  const b = variante % 2 === 1
  switch (tipo) {
    case 'completo':
      return ['sentadilla', 'empuje-h', b ? 'tiron-v' : 'tiron-h', 'bisagra', 'empuje-v', b ? 'triceps' : 'biceps', 'core', 'hombro-post']
    case 'torso':
      return ['empuje-h', 'tiron-v', 'empuje-v', 'tiron-h', b ? 'hombro-post' : 'pecho-aisl', 'biceps', 'triceps', 'hombro-aisl']
    case 'pierna':
      return ['sentadilla', 'bisagra', b ? 'isquio-aisl' : 'cuadriceps-aisl', b ? 'cuadriceps-aisl' : 'isquio-aisl', 'gluteo-aisl', 'pantorrilla', 'core']
    case 'push':
      return ['empuje-h', 'empuje-v', 'empuje-h', 'hombro-aisl', 'triceps', 'pecho-aisl', 'triceps']
    case 'pull':
      return ['tiron-v', 'tiron-h', 'hombro-post', 'biceps', 'tiron-h', 'biceps', 'trapecio']
  }
}

/** Lo que el usuario quiere mejorar: esos patrones suben de prioridad en los días donde corresponden. */
function refuerzos(zonas: Zona[], tipo: TipoDia): Patron[] {
  const extra: Partial<Record<Zona, Partial<Record<TipoDia, Patron[]>>>> = {
    'piernas-gluteos': { completo: ['gluteo-aisl'], pierna: ['gluteo-aisl', 'bisagra'] },
    brazos: { completo: ['biceps', 'triceps'], torso: ['biceps', 'triceps'], push: ['triceps'], pull: ['biceps'] },
    pecho: { completo: ['pecho-aisl'], torso: ['pecho-aisl'], push: ['pecho-aisl'] },
    espalda: { completo: ['tiron-h'], torso: ['tiron-h'], pull: ['tiron-v'] },
    hombros: { completo: ['hombro-aisl'], torso: ['hombro-aisl'], push: ['hombro-aisl'], pull: ['hombro-post'] },
    abdomen: { completo: ['core'], torso: ['core'], pierna: ['core'], push: ['core'], pull: ['core'] },
  }
  return zonas.flatMap((z) => extra[z]?.[tipo] ?? [])
}

export interface Prescripcion {
  series: number
  reps: number
  descanso: number
}

/**
 * Series, reps y descanso (s) según el objetivo, para un compuesto y un aislamiento:
 * músculo 3–4 × 8–12 con 60–90 s; fuerza 4–5 × 3–6 con 2–3 min; grasa y resistencia 2–3 × 12–20 con 30–60 s;
 * salud general 2–3 × 10–12 con 60–75 s.
 */
const TABLA: Record<Objetivo, [Prescripcion, Prescripcion]> = {
  musculo: [{ series: 4, reps: 8, descanso: 90 }, { series: 3, reps: 12, descanso: 60 }],
  fuerza: [{ series: 5, reps: 5, descanso: 180 }, { series: 3, reps: 8, descanso: 90 }],
  grasa: [{ series: 3, reps: 12, descanso: 60 }, { series: 3, reps: 15, descanso: 45 }],
  resistencia: [{ series: 3, reps: 15, descanso: 45 }, { series: 2, reps: 20, descanso: 30 }],
  condicion: [{ series: 3, reps: 10, descanso: 75 }, { series: 2, reps: 12, descanso: 60 }],
}

/** `principal`: es uno de los dos primeros compuestos del día. Los compuestos que siguen van como accesorios. */
export function prescripcion(perfil: Perfil, patron: Patron, principal = true): Prescripcion {
  const compuesto = PATRONES_COMPUESTOS.includes(patron) && principal
  const p = { ...TABLA[perfil.objetivo][compuesto ? 0 : 1] }
  if (perfil.experiencia === 'principiante') {
    p.series = Math.max(2, p.series - 1)
    if (perfil.objetivo === 'fuerza' && compuesto) p.reps = 6 // aprender con un poco más de reps
  }
  if (perfil.precaucion) p.series = Math.min(p.series, 3)
  if (patron === 'core' || patron === 'pantorrilla') {
    p.reps = Math.max(p.reps, 15)
    p.descanso = Math.min(p.descanso, 60)
  }
  // Mayores de 50 o con alguna alerta de salud: nada muy pesado (mínimo 8 reps) y un poco más de descanso.
  if (edad(perfil) >= 50 || perfil.precaucion) {
    p.reps = Math.max(p.reps, 8)
    p.descanso = Math.min(p.descanso, 120) + 15
  }
  return p
}

/** Minutos que toma un ejercicio: series × (descanso + ~40 s de trabajo) + 1,5 min de preparación. */
export const minutosDe = (p: Pick<Prescripcion, 'series' | 'descanso'>) => (p.series * (p.descanso + 40)) / 60 + 1.5
const MAXIMO_EJERCICIOS: Record<Experiencia, number> = { principiante: 6, intermedio: 7, avanzado: 8 }
/** Minutos que se reservan para el calentamiento. */
export const MINUTOS_CALENTAMIENTO = 8

/** Preferencia de equipo según la experiencia (menor = mejor). Principiantes: máquinas, más fáciles y seguras. */
function costoEquipo(equipo: Equipo, experiencia: Experiencia, compuesto: boolean): number {
  const maquina = ['maquina', 'smith', 'polea'].includes(equipo)
  // Con el peso corporal (salvo dominadas y fondos) no hay cómo progresar con carga: queda al final en los compuestos.
  const corporal = equipo === 'peso-corporal' && compuesto ? 1 : 0
  if (experiencia === 'principiante') return (maquina ? 0 : equipo === 'mancuernas' ? 1 : equipo === 'barra' ? 2 : 1) + corporal
  if (experiencia === 'intermedio') return (compuesto ? (equipo === 'mancuernas' ? 0 : equipo === 'barra' ? 0.3 : 0.5) : maquina ? 0 : 0.5) + corporal
  return (compuesto ? (equipo === 'barra' ? 0 : equipo === 'mancuernas' ? 0.3 : 0.8) : maquina ? 0 : 0.3) + corporal
}

/** ¿Puede hacer este ejercicio donde entrena, con el equipo que tiene? */
export function tieneEquipo(perfil: Pick<Perfil, 'lugar' | 'equipamiento'>, ejercicio: Exercise): boolean {
  if (ejercicio.equipo === 'otro' || ejercicio.equipo === 'rodillo') return false
  if (perfil.lugar === 'gimnasio') return true
  const disponible = perfil.equipamiento ?? EQUIPAMIENTO_POR_DEFECTO
  if (necesitaGimnasio(ejercicio) || ['maquina', 'smith', 'polea'].includes(ejercicio.equipo)) return false
  if (necesitaBarras(ejercicio)) return disponible.includes('barras-dominadas')
  if (ejercicio.equipo === 'peso-corporal') return true
  return (disponible as string[]).includes(ejercicio.equipo)
}

/** Ejercicios del catálogo que sirven para un patrón, filtrados por lesiones, equipo y nivel. */
export function candidatos(perfil: Perfil, ejercicios: Exercise[], patron: Patron): Exercise[] {
  const nivelMax = perfil.experiencia === 'principiante' || perfil.precaucion ? 2 : 3
  return ejercicios.filter((e) => {
    const cl = clasificar(e)
    if (!cl || cl.patron !== patron || cl.nivel > nivelMax) return false
    if (e.nombre === 'Plancha') return false // isométrico: se mide en segundos, no en reps
    if (!tieneEquipo(perfil, e)) return false
    return !cl.riesgos?.some((r) => perfil.lesiones.includes(r))
  })
}

/** Factor sobre el peso corporal para un hombre principiante; se ajusta por sexo, experiencia y objetivo. */
const FACTOR: Partial<Record<Patron, Partial<Record<Equipo, number>>>> = {
  sentadilla: { barra: 0.5, smith: 0.5, maquina: 0.6, mancuernas: 0.12, kettlebell: 0.15 },
  bisagra: { barra: 0.5, smith: 0.5, mancuernas: 0.15, kettlebell: 0.2 },
  'empuje-h': { barra: 0.45, smith: 0.4, maquina: 0.35, mancuernas: 0.15 },
  'empuje-v': { barra: 0.3, maquina: 0.25, mancuernas: 0.1, kettlebell: 0.1 },
  'tiron-v': { polea: 0.45, maquina: 0.45 },
  'tiron-h': { barra: 0.4, maquina: 0.35, polea: 0.4, mancuernas: 0.17, kettlebell: 0.17 },
  'pecho-aisl': { maquina: 0.25, polea: 0.1, mancuernas: 0.06 },
  'espalda-aisl': { polea: 0.15, mancuernas: 0.1 },
  'hombro-aisl': { polea: 0.06, smith: 0.2, mancuernas: 0.05, maquina: 0.15 },
  'hombro-post': { polea: 0.06, mancuernas: 0.04, maquina: 0.15 },
  trapecio: { polea: 0.4, smith: 0.5, barra: 0.5, mancuernas: 0.2 },
  'cuadriceps-aisl': { maquina: 0.35 },
  'isquio-aisl': { maquina: 0.25 },
  'gluteo-aisl': { maquina: 0.4, polea: 0.06 },
  pantorrilla: { maquina: 0.5, smith: 0.5 },
  biceps: { barra: 0.2, maquina: 0.15, polea: 0.15, mancuernas: 0.07 },
  triceps: { barra: 0.2, maquina: 0.2, polea: 0.2, mancuernas: 0.07 },
  core: { polea: 0.2 },
}
const TREN_INFERIOR: Patron[] = ['sentadilla', 'bisagra', 'cuadriceps-aisl', 'isquio-aisl', 'gluteo-aisl', 'pantorrilla']

/** Peso de partida sugerido en kg (las mancuernas, por mancuerna). `undefined` si es con el peso corporal. */
export function pesoSugerido(perfil: Perfil, ejercicio: Exercise, patron: Patron): number | undefined {
  const prensa = /prensa/i.test(ejercicio.nombre)
  let factor = prensa ? (patron === 'pantorrilla' ? 0.8 : 1) : FACTOR[patron]?.[ejercicio.equipo]
  if (!factor) return undefined
  if (/rumano|hip thrust/i.test(ejercicio.nombre)) factor *= 0.8
  if (/una mano|un brazo|una pierna|unilateral/i.test(ejercicio.nombre)) factor *= 0.5
  if (perfil.sexo === 'mujer') factor *= TREN_INFERIOR.includes(patron) ? 0.75 : 0.55
  factor *= { principiante: 1, intermedio: 1.35, avanzado: 1.7 }[perfil.experiencia]
  factor *= { fuerza: 1.15, musculo: 1, grasa: 0.85, resistencia: 0.75, condicion: 0.85 }[perfil.objetivo]
  if (perfil.precaucion) factor *= 0.8
  if (edad(perfil) >= 60) factor *= 0.85
  const kg = perfil.pesoKg * factor
  const [paso, minimo] =
    prensa ? [5, 20] : ejercicio.equipo === 'barra' ? [2.5, 20] : ejercicio.equipo === 'mancuernas' ? [1, 2] : ejercicio.equipo === 'kettlebell' ? [4, 8] : [2.5, 5]
  return Math.max(minimo, Math.round(kg / paso) * paso)
}

// --- Calentamiento ---------------------------------------------------------------------------------------------

const MOVILIDAD: Record<'superior' | 'inferior' | 'completo', string[]> = {
  superior: ['Círculos de brazos', 'Estiramiento dinámico de pecho', 'Estiramiento dinámico de espalda'],
  inferior: ['Balanceo de pierna adelante y atrás', 'Círculos de cadera en cuadrupedia', 'Círculos de tobillo'],
  completo: ['Círculos de brazos', 'Balanceo de pierna adelante y atrás', 'Círculos de cadera en cuadrupedia'],
}

function calentamiento(perfil: Perfil, tipo: TipoDia, ejercicios: Exercise[]): PasoCalentamiento[] {
  const porNombre = new Map(ejercicios.map((e) => [e.nombre, e.id!]))
  // Cardio suave: en el gimnasio, bicicleta o elíptica (más amable con las rodillas); fuera, skipping suave.
  const cardio =
    perfil.lugar === 'gimnasio' ? (perfil.lesiones.includes('rodillas') ? 'Bicicleta estática' : 'Elíptica') : perfil.lesiones.includes('rodillas') ? undefined : 'Skipping rápido'
  const zona = tipo === 'pierna' ? 'inferior' : tipo === 'completo' ? 'completo' : 'superior'
  return [
    ...(cardio ? [{ nombre: cardio, segundos: perfil.lugar === 'gimnasio' ? 300 : 120 }] : []),
    ...MOVILIDAD[zona].map((nombre) => ({ nombre, segundos: 40 })),
  ].flatMap(({ nombre, segundos }) => {
    const exerciseId = porNombre.get(nombre)
    return exerciseId === undefined ? [] : [{ exerciseId, segundos }]
  })
}

/** Los 79 ejercicios de siempre: clasificados a mano y con nombres conocidos, se prefieren en el plan. */
const BASICOS = new Set(EJERCICIOS_BASE.map((e) => e.nombre))

// --- Plan --------------------------------------------------------------------------------------------------------

export function generarPlan(perfil: Perfil, ejercicios: Exercise[]): PlanGenerado {
  const { division: div, tipos } = division(perfil.diasPorSemana)
  const usadosEnElPlan = new Set<number>()
  const variantePorTipo: Partial<Record<TipoDia, number>> = {}

  const dias = tipos.map((tipo): DiaGenerado => {
    const variante = (variantePorTipo[tipo] = (variantePorTipo[tipo] ?? -1) + 1)
    const base = huecos(tipo, variante)
    // Los refuerzos entran justo después de los dos primeros ejercicios (los principales del día). Si el patrón ya
    // estaba más abajo en el día, se adelanta en vez de repetirse.
    const resto = base.slice(2)
    const adelantados = refuerzos(perfil.zonas, tipo).filter((patron) => {
      const i = resto.indexOf(patron)
      if (i >= 0) resto.splice(i, 1)
      return !base.slice(0, 2).includes(patron)
    })
    const orden = [...base.slice(0, 2), ...new Set(adelantados), ...resto]
    const elegidos: (RoutineExercise & { patron: Patron })[] = []
    let minutos = MINUTOS_CALENTAMIENTO
    for (const patron of orden) {
      const opciones = candidatos(perfil, ejercicios, patron).filter((e) => !elegidos.some((x) => x.exerciseId === e.id))
      if (opciones.length === 0) continue
      const compuesto = PATRONES_COMPUESTOS.includes(patron)
      // Se prefieren los 79 básicos (clasificados a mano, con nombres conocidos), variar un poco entre días (sin
      // evitar repetir los básicos: en cuerpo completo es normal) y, para principiantes, los más fáciles.
      const costo = (e: Exercise) =>
        costoEquipo(e.equipo, perfil.experiencia, compuesto) +
        (usadosEnElPlan.has(e.id!) ? 1.2 : 0) +
        clasificar(e)!.nivel * (perfil.experiencia === 'principiante' ? 0.8 : 0.1) +
        (BASICOS.has(e.nombre) ? 0 : 0.6)
      const elegido = [...opciones].sort((a, b) => costo(a) - costo(b) || a.nombre.localeCompare(b.nombre))[0]
      const principal = elegidos.filter((x) => PATRONES_COMPUESTOS.includes(x.patron)).length < 2
      const p = prescripcion(perfil, patron, principal)
      if (elegidos.length >= MAXIMO_EJERCICIOS[perfil.experiencia]) break
      if (elegidos.length >= 3 && minutos + minutosDe(p) > perfil.minutosPorSesion) break
      minutos += minutosDe(p)
      usadosEnElPlan.add(elegido.id!)
      elegidos.push({
        patron,
        exerciseId: elegido.id!,
        seriesObjetivo: p.series,
        repsObjetivo: p.reps,
        descansoSeg: p.descanso,
        pesoSugerido: pesoSugerido(perfil, elegido, patron),
      })
    }
    // Compuestos primero y aislamiento al final (manteniendo el orden de prioridad dentro de cada parte).
    const ordenados = [...elegidos].sort((a, b) => Number(!PATRONES_COMPUESTOS.includes(a.patron)) - Number(!PATRONES_COMPUESTOS.includes(b.patron)))
    return {
      tipo,
      nombre: NOMBRE_TIPO[tipo],
      foco: FOCO_TIPO[tipo],
      patrones: orden,
      ejercicios: ordenados.map(({ patron: _, ...x }) => x),
      calentamiento: calentamiento(perfil, tipo, ejercicios),
    }
  })

  return { division: div, dias, recomendaciones: recomendaciones(perfil), origen: 'reglas' }
}

/** Minutos estimados de una rutina: calentamiento + ejercicios (para mostrar en la vista semanal). */
export function duracionEstimada(rutina: { ejercicios: Pick<RoutineExercise, 'seriesObjetivo' | 'descansoSeg'>[]; calentamiento?: PasoCalentamiento[] }): number {
  const calentar = (rutina.calentamiento ?? []).reduce((s, c) => s + c.segundos, 0) / 60
  const trabajo = rutina.ejercicios.reduce((s, e) => s + minutosDe({ series: e.seriesObjetivo, descanso: e.descansoSeg }), 0)
  return Math.round((calentar + trabajo) / 5) * 5
}

export function recomendaciones(perfil: Perfil): string[] {
  const r: string[] = []
  if (perfil.precaucion)
    r.push('Respondiste que sí a una pregunta de salud: consulta a un médico antes de partir. El plan empieza con pesos más bajos y sin ejercicios muy técnicos.')
  if (perfil.lesiones.length) {
    const zonas = { rodillas: 'las rodillas', espalda: 'la espalda baja', hombros: 'los hombros', munecas: 'las muñecas' }
    const lista = perfil.lesiones.map((l) => zonas[l])
    r.push(
      `Dejamos fuera los ejercicios que exigen ${lista.length > 1 ? `${lista.slice(0, -1).join(', ')} y ${lista.at(-1)}` : lista[0]}. Si sientes dolor (distinto al cansancio muscular), para ese ejercicio.`,
    )
  }
  if (perfil.experiencia === 'principiante')
    r.push(
      perfil.lugar === 'gimnasio'
        ? 'Las primeras dos semanas, prioriza aprender bien la técnica. Si tienes dudas con una máquina, pídele ayuda al profesor del gimnasio.'
        : 'Las primeras dos semanas, prioriza aprender bien la técnica: mira las fotos de cada ejercicio y hazlo frente a un espejo si puedes.',
    )
  if (perfil.diasPorSemana <= 3) r.push('Con cuerpo completo, deja al menos un día de descanso entre sesiones para que los músculos se recuperen.')
  r.push('Antes de cada sesión haz el calentamiento sugerido. Los pesos sugeridos son un punto de partida: la última serie debería costarte, pero sin perder la técnica.')
  r.push('Cuando completes todas las series y reps de un ejercicio en dos sesiones seguidas, la app te sugiere subir el peso.')
  if (perfil.objetivo === 'grasa')
    r.push('Suma 20–30 minutos de cardio suave (caminar rápido, bicicleta o elíptica) 2 o 3 veces por semana. Para bajar grasa, la alimentación pesa más que el entrenamiento.')
  if (perfil.objetivo === 'resistencia') r.push('Descansa poco entre series y suma 2 o 3 sesiones de cardio por semana para mejorar tu capacidad aeróbica.')
  if (perfil.objetivo === 'musculo') r.push('Para ganar músculo, come suficiente proteína en cada comida y duerme entre 7 y 9 horas.')
  if (perfil.objetivo === 'fuerza') r.push('Antes de cada ejercicio principal, haz 2 o 3 series de aproximación con poco peso.')
  if (edad(perfil) >= 50) r.push('Calienta bien antes de empezar y evita aguantar la respiración al hacer fuerza.')
  return r
}

/**
 * Ejercicios que de verdad pueden reemplazar a otro en el entreno (máquina ocupada, no le acomoda…): mismo patrón de
 * movimiento (o, si no está clasificado, mismo tipo y músculo principal), que el usuario pueda hacer con su equipo,
 * sin sus lesiones y, para principiantes o con precaución, sin los muy técnicos. Primero los del mismo músculo
 * principal, los del mismo equipo y los básicos.
 */
export function alternativas(ejercicio: Exercise, catalogo: Exercise[], perfil: Perfil | null, cantidad = 30): Exercise[] {
  const cl = clasificar(ejercicio)
  const principal = mediosDe(ejercicio).musculos.principales[0]
  const categoria = FICHAS[ejercicio.nombre]?.categoria
  const nivelMax = perfil && (perfil.experiencia === 'principiante' || perfil.precaucion) ? 2 : 3
  return catalogo
    .filter((e) => {
      if (e.id === ejercicio.id || e.nombre === ejercicio.nombre) return false
      const otra = clasificar(e)
      const parecido = cl
        ? otra?.patron === cl.patron
        : mediosDe(e).musculos.principales[0] === principal &&
          e.grupoMuscular === ejercicio.grupoMuscular &&
          (e.propio || FICHAS[e.nombre]?.categoria === categoria)
      if (!parecido) return false
      if (!perfil) return true
      if (otra && otra.nivel > nivelMax) return false
      return tieneEquipo(perfil, e) && !otra?.riesgos?.some((r) => perfil.lesiones.includes(r))
    })
    .map((e) => ({
      e,
      costo:
        (mediosDe(e).musculos.principales[0] === principal ? 0 : 1.5) +
        (e.equipo === ejercicio.equipo ? 0 : 0.6) +
        (BASICOS.has(e.nombre) ? 0 : 0.5) +
        (clasificar(e)?.nivel ?? 2) * 0.1,
    }))
    .sort((a, b) => a.costo - b.costo || a.e.nombre.localeCompare(b.e.nombre))
    .slice(0, cantidad)
    .map(({ e }) => e)
}

/**
 * El ejercicio de una rutina reemplazado por otro: mantiene series, reps y descanso; quita la nota del anterior y, si
 * tenía peso sugerido (rutinas del plan), lo recalcula para el nuevo.
 */
export function reemplazoEnRutina(
  item: RoutineExercise,
  nuevo: Exercise,
  perfil: Perfil | null | undefined,
  anterior?: Exercise,
): RoutineExercise {
  // Entre cardio y fuerza las "reps" cambian de significado (minutos): se parte con los valores por defecto.
  if (anterior && esCardio(anterior) !== esCardio(nuevo)) return { exerciseId: nuevo.id!, ...objetivoPorDefecto(nuevo), descansoSeg: item.descansoSeg }
  const patron = clasificar(nuevo)?.patron
  const peso = item.pesoSugerido !== undefined && perfil && patron ? pesoSugerido(perfil, nuevo, patron) : undefined
  return {
    exerciseId: nuevo.id!,
    seriesObjetivo: item.seriesObjetivo,
    repsObjetivo: item.repsObjetivo,
    descansoSeg: item.descansoSeg,
    ...(peso !== undefined && { pesoSugerido: peso }),
  }
}

// --- IA (ver lib/planIa.ts y api/plan-ia.ts) -------------------------------------------------------------------

/** Rangos de la guía por objetivo, para compuestos principales y para aislamiento o accesorios. */
const RANGOS: Record<Objetivo, { compuesto: Rango; aislamiento: Rango }> = {
  musculo: { compuesto: { series: [3, 4], reps: [8, 12], descanso: [60, 90] }, aislamiento: { series: [2, 4], reps: [10, 15], descanso: [45, 90] } },
  fuerza: { compuesto: { series: [4, 5], reps: [3, 6], descanso: [120, 180] }, aislamiento: { series: [2, 4], reps: [6, 12], descanso: [60, 120] } },
  grasa: { compuesto: { series: [2, 3], reps: [12, 20], descanso: [30, 60] }, aislamiento: { series: [2, 3], reps: [12, 20], descanso: [30, 60] } },
  resistencia: { compuesto: { series: [2, 3], reps: [12, 20], descanso: [30, 60] }, aislamiento: { series: [2, 3], reps: [15, 20], descanso: [30, 45] } },
  condicion: { compuesto: { series: [2, 3], reps: [10, 12], descanso: [60, 90] }, aislamiento: { series: [2, 3], reps: [10, 15], descanso: [45, 75] } },
}

export function rangosPara(perfil: Perfil): { compuesto: Rango; aislamiento: Rango } {
  const ajustar = (r: Rango): Rango => {
    const series: [number, number] = [...r.series]
    const reps: [number, number] = [...r.reps]
    if (perfil.experiencia === 'principiante') series[1] = Math.max(2, series[1] - 1)
    if (perfil.precaucion) series[1] = Math.min(series[1], 3)
    if (perfil.precaucion || edad(perfil) >= 50) reps[0] = Math.max(reps[0], 8)
    series[0] = Math.min(series[0], series[1])
    reps[1] = Math.max(reps[1], reps[0])
    return { series, reps, descanso: [...r.descanso] }
  }
  const r = RANGOS[perfil.objetivo]
  return { compuesto: ajustar(r.compuesto), aislamiento: ajustar(r.aislamiento) }
}

/** Arma lo que se le manda a la IA: perfil reducido, rangos y, por día, candidatos filtrados por las reglas. */
export function pedidoIa(perfil: Perfil, plan: PlanGenerado, ejercicios: Exercise[]): PedidoIa {
  const porId = new Map(ejercicios.map((e) => [e.id!, e]))
  return {
    perfil: {
      objetivo: perfil.objetivo === 'condicion' ? 'salud general' : perfil.objetivo,
      experiencia: perfil.experiencia,
      lugar: perfil.lugar,
      equipamiento: perfil.lugar === 'gimnasio' ? [] : (perfil.equipamiento ?? EQUIPAMIENTO_POR_DEFECTO),
      diasPorSemana: perfil.diasPorSemana,
      minutosPorSesion: perfil.minutosPorSesion,
      zonas: perfil.zonas,
      lesiones: perfil.lesiones,
      precaucion: perfil.precaucion,
    },
    rangos: rangosPara(perfil),
    dias: plan.dias.map((d) => {
      const ids = new Set(d.ejercicios.map((x) => x.exerciseId))
      for (const patron of new Set(d.patrones)) {
        const opciones = candidatos(perfil, ejercicios, patron).sort(
          (a, b) => Number(!BASICOS.has(a.nombre)) - Number(!BASICOS.has(b.nombre)) || clasificar(a)!.nivel - clasificar(b)!.nivel,
        )
        for (const e of opciones.slice(0, 5)) ids.add(e.id!)
      }
      return {
        tipo: NOMBRE_TIPO[d.tipo],
        foco: d.foco,
        base: d.ejercicios.map((x) => x.exerciseId),
        maxEjercicios: Math.max(d.ejercicios.length + 1, 4),
        candidatos: [...ids].map((id) => {
          const e = porId.get(id)!
          const cl = clasificar(e)!
          return { id, nombre: e.nombre, patron: cl.patron, compuesto: PATRONES_COMPUESTOS.includes(cl.patron), equipo: e.equipo, nivel: cl.nivel }
        }),
      }
    }),
  }
}

/**
 * Aplica la respuesta (ya validada) de la IA: sus ejercicios, series, reps, descansos y notas, con el peso sugerido
 * de las reglas y los compuestos siempre primero. El calentamiento y la división no cambian.
 */
export function aplicarIa(perfil: Perfil, plan: PlanGenerado, diasIa: DiaIa[], ejercicios: Exercise[]): PlanGenerado {
  const porId = new Map(ejercicios.map((e) => [e.id!, e]))
  const dias = plan.dias.map((d, i) => {
    const ia = diasIa[i]
    const lista = ia.exercises.map((x) => {
      const e = porId.get(x.id)!
      const patron = clasificar(e)!.patron
      return {
        compuesto: PATRONES_COMPUESTOS.includes(patron),
        ejercicio: {
          exerciseId: x.id,
          seriesObjetivo: x.sets,
          repsObjetivo: x.reps,
          descansoSeg: x.restSeconds,
          pesoSugerido: pesoSugerido(perfil, e, patron),
          ...(x.note && { nota: x.note }),
        } satisfies RoutineExercise,
      }
    })
    const ordenados = [...lista].sort((a, b) => Number(!a.compuesto) - Number(!b.compuesto)).map((x) => x.ejercicio)
    return { ...d, foco: ia.focus || d.foco, nota: ia.note || undefined, ejercicios: ordenados }
  })
  return { ...plan, dias, origen: 'ia' }
}
