import { CLASIFICACION, PATRONES_COMPUESTOS, type Patron } from '../db/patronesEjercicios'
import type { Division, Equipo, Exercise, Experiencia, Objetivo, Perfil, RoutineExercise, Zona } from '../types'

/**
 * Generador de planes por reglas (sin IA, funciona offline). Recibe la evaluación y el catálogo y arma los días.
 * Es una función pura: no toca la base de datos (eso lo hace db/plan.ts).
 */

type TipoDia = 'completo' | 'torso' | 'pierna' | 'push' | 'pull'

export interface DiaGenerado {
  nombre: string
  tipo: TipoDia
  ejercicios: RoutineExercise[]
}

export interface PlanGenerado {
  division: Division
  dias: DiaGenerado[]
  recomendaciones: string[]
}

export const NOMBRE_TIPO: Record<TipoDia, string> = {
  completo: 'Cuerpo completo',
  torso: 'Torso',
  pierna: 'Pierna',
  push: 'Empuje',
  pull: 'Tirón',
}

export const DESCRIPCION_DIVISION: Record<Division, string> = {
  completo: 'Cuerpo completo: cada sesión trabaja todos los grupos musculares. Ideal para pocos días o para partir.',
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

function division(dias: number, experiencia: Experiencia): { division: Division; tipos: TipoDia[] } {
  if (dias <= 2) return { division: 'completo', tipos: ['completo', 'completo'] }
  if (dias === 3)
    return experiencia === 'principiante'
      ? { division: 'completo', tipos: ['completo', 'completo', 'completo'] }
      : { division: 'ppl', tipos: ['push', 'pull', 'pierna'] }
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

interface Prescripcion {
  series: number
  reps: number
  descanso: number
}

function prescripcion(perfil: Perfil, patron: Patron): Prescripcion {
  const compuesto = PATRONES_COMPUESTOS.includes(patron)
  const tabla: Record<Objetivo, [Prescripcion, Prescripcion]> = {
    fuerza: [{ series: 5, reps: 5, descanso: 180 }, { series: 3, reps: 8, descanso: 90 }],
    musculo: [{ series: 4, reps: 8, descanso: 120 }, { series: 3, reps: 12, descanso: 75 }],
    grasa: [{ series: 3, reps: 12, descanso: 60 }, { series: 3, reps: 15, descanso: 45 }],
    condicion: [{ series: 3, reps: 10, descanso: 75 }, { series: 2, reps: 12, descanso: 60 }],
  }
  const p = { ...tabla[perfil.objetivo][compuesto ? 0 : 1] }
  if (perfil.experiencia === 'principiante') p.series = Math.max(2, p.series - 1)
  if (perfil.experiencia === 'avanzado' && compuesto) p.series += 1
  if (perfil.precaucion) p.series = Math.min(p.series, 4)
  if (patron === 'core' || patron === 'pantorrilla') p.reps = Math.max(p.reps, 15)
  // Mayores de 50 o con alguna alerta de salud: nada muy pesado (mínimo 8 reps) y un poco más de descanso.
  if (edad(perfil) >= 50 || perfil.precaucion) {
    p.reps = Math.max(p.reps, 8)
    p.descanso = Math.min(p.descanso, 120) + 15
  }
  return p
}

/** Minutos que toma un ejercicio: series × (descanso + ~40 s de trabajo) + 1,5 min de preparación. */
const minutosDe = (p: Prescripcion) => (p.series * (p.descanso + 40)) / 60 + 1.5
const MAXIMO_EJERCICIOS: Record<Experiencia, number> = { principiante: 6, intermedio: 7, avanzado: 8 }

/** Preferencia de equipo según la experiencia (menor = mejor). Principiantes: máquinas, más fáciles y seguras. */
function costoEquipo(equipo: Equipo, experiencia: Experiencia, compuesto: boolean): number {
  const maquina = ['maquina', 'smith', 'polea'].includes(equipo)
  // Con el peso corporal (salvo dominadas y fondos) no hay cómo progresar con carga: queda al final en los compuestos.
  const corporal = equipo === 'peso-corporal' && compuesto ? 1 : 0
  if (experiencia === 'principiante') return (maquina ? 0 : equipo === 'mancuernas' ? 1 : equipo === 'barra' ? 2 : 1) + corporal
  if (experiencia === 'intermedio') return (compuesto ? (equipo === 'mancuernas' ? 0 : equipo === 'barra' ? 0.3 : 0.5) : maquina ? 0 : 0.5) + corporal
  return (compuesto ? (equipo === 'barra' ? 0 : equipo === 'mancuernas' ? 0.3 : 0.8) : maquina ? 0 : 0.3) + corporal
}

const EQUIPO_CASA: Equipo[] = ['mancuernas', 'peso-corporal', 'banda', 'kettlebell']
/** Isométricos (se miden en segundos, no en reps): no entran al plan. */
const EXCLUIDOS = new Set(['Plancha'])

function candidatos(perfil: Perfil, ejercicios: Exercise[], patron: Patron): Exercise[] {
  const nivelMax = perfil.experiencia === 'principiante' || perfil.precaucion ? 2 : 3
  return ejercicios.filter((e) => {
    const cl = CLASIFICACION[e.nombre]
    if (!cl || e.propio || EXCLUIDOS.has(e.nombre) || cl.patron !== patron || cl.nivel > nivelMax) return false
    if (perfil.lugar === 'casa' && !EQUIPO_CASA.includes(e.equipo)) return false
    return !cl.riesgos?.some((r) => perfil.lesiones.includes(r))
  })
}

/** Factor sobre el peso corporal para un hombre principiante; se ajusta por sexo, experiencia y objetivo. */
const FACTOR: Partial<Record<Patron, Partial<Record<Equipo, number>>>> = {
  sentadilla: { barra: 0.5, smith: 0.5, maquina: 0.6, mancuernas: 0.12 },
  bisagra: { barra: 0.5, smith: 0.5, mancuernas: 0.15 },
  'empuje-h': { barra: 0.45, smith: 0.4, maquina: 0.35, mancuernas: 0.15 },
  'empuje-v': { barra: 0.3, maquina: 0.25, mancuernas: 0.1 },
  'tiron-v': { polea: 0.45 },
  'tiron-h': { barra: 0.4, maquina: 0.35, polea: 0.4, mancuernas: 0.17 },
  'pecho-aisl': { maquina: 0.25, polea: 0.1, mancuernas: 0.06 },
  'espalda-aisl': { polea: 0.15 },
  'hombro-aisl': { polea: 0.06, smith: 0.2, mancuernas: 0.05 },
  'hombro-post': { polea: 0.06, mancuernas: 0.04 },
  trapecio: { polea: 0.4, smith: 0.5 },
  'cuadriceps-aisl': { maquina: 0.35 },
  'isquio-aisl': { maquina: 0.25 },
  'gluteo-aisl': { maquina: 0.4, polea: 0.06 },
  pantorrilla: { maquina: 0.5 },
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
  if (perfil.sexo === 'mujer') factor *= TREN_INFERIOR.includes(patron) ? 0.75 : 0.55
  factor *= { principiante: 1, intermedio: 1.35, avanzado: 1.7 }[perfil.experiencia]
  factor *= { fuerza: 1.15, musculo: 1, grasa: 0.85, condicion: 0.85 }[perfil.objetivo]
  if (perfil.precaucion) factor *= 0.8
  if (edad(perfil) >= 60) factor *= 0.85
  const kg = perfil.pesoKg * factor
  const [paso, minimo] =
    prensa ? [5, 20] : ejercicio.equipo === 'barra' ? [2.5, 20] : ejercicio.equipo === 'mancuernas' ? [1, 2] : [2.5, 5]
  return Math.max(minimo, Math.round(kg / paso) * paso)
}

export function generarPlan(perfil: Perfil, ejercicios: Exercise[]): PlanGenerado {
  const { division: div, tipos } = division(perfil.diasPorSemana, perfil.experiencia)
  const usadosEnElPlan = new Set<number>()
  const variantePorTipo: Partial<Record<TipoDia, number>> = {}

  const dias = tipos.map((tipo) => {
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
    const elegidos: RoutineExercise[] = []
    let minutos = 0
    for (const patron of orden) {
      const opciones = candidatos(perfil, ejercicios, patron).filter((e) => !elegidos.some((x) => x.exerciseId === e.id))
      if (opciones.length === 0) continue
      const compuesto = PATRONES_COMPUESTOS.includes(patron)
      const costo = (e: Exercise) =>
        costoEquipo(e.equipo, perfil.experiencia, compuesto) + (usadosEnElPlan.has(e.id!) ? 3 : 0) + CLASIFICACION[e.nombre].nivel * 0.1
      const elegido = [...opciones].sort((a, b) => costo(a) - costo(b) || a.nombre.localeCompare(b.nombre))[0]
      const p = prescripcion(perfil, patron)
      if (elegidos.length >= MAXIMO_EJERCICIOS[perfil.experiencia]) break
      if (elegidos.length >= 3 && minutos + minutosDe(p) > perfil.minutosPorSesion) break
      minutos += minutosDe(p)
      usadosEnElPlan.add(elegido.id!)
      elegidos.push({
        exerciseId: elegido.id!,
        seriesObjetivo: p.series,
        repsObjetivo: p.reps,
        descansoSeg: p.descanso,
        pesoSugerido: pesoSugerido(perfil, elegido, patron),
      })
    }
    return { tipo, nombre: NOMBRE_TIPO[tipo], ejercicios: elegidos }
  })

  return { division: div, dias, recomendaciones: recomendaciones(perfil) }
}

export function recomendaciones(perfil: Perfil): string[] {
  const r: string[] = []
  if (perfil.precaucion)
    r.push('Respondiste que sí a una pregunta de salud: consulta a un médico antes de partir. El plan empieza con pesos más bajos y sin ejercicios muy técnicos.')
  if (perfil.lesiones.length) {
    const zonas = { rodillas: 'las rodillas', espalda: 'la espalda baja', hombros: 'los hombros' }
    r.push(
      `Dejamos fuera los ejercicios que exigen ${perfil.lesiones.map((l) => zonas[l]).join(' y ')}. Si sientes dolor (distinto al cansancio muscular), para ese ejercicio.`,
    )
  }
  if (perfil.experiencia === 'principiante')
    r.push('Las primeras dos semanas, prioriza aprender bien la técnica. Si tienes dudas con una máquina, pídele ayuda al profesor del gimnasio.')
  r.push('Los pesos sugeridos son un punto de partida: la última serie debería costarte, pero sin perder la técnica. Ajústalos en el primer entreno.')
  r.push('Cuando completes todas las series y reps de un ejercicio, la app te sugiere subir el peso la próxima vez.')
  if (perfil.objetivo === 'grasa')
    r.push('Suma 20–30 minutos de cardio suave (caminar rápido, bicicleta o elíptica) 2 o 3 veces por semana. Para bajar grasa, la alimentación pesa más que el entrenamiento.')
  if (perfil.objetivo === 'musculo') r.push('Para ganar músculo, come suficiente proteína en cada comida y duerme entre 7 y 9 horas.')
  if (perfil.objetivo === 'fuerza') r.push('Antes de cada ejercicio principal, haz 2 o 3 series de calentamiento con poco peso.')
  if (edad(perfil) >= 50) r.push('Calienta 10 minutos antes de empezar (bicicleta o elíptica suave) y evita aguantar la respiración al hacer fuerza.')
  return r
}
