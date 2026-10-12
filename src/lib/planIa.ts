/**
 * Contrato entre la app y la función `api/plan-ia` (Gemini). Este archivo lo usan los dos lados, así que no puede
 * importar nada pesado ni con secretos: solo tipos y lógica pura.
 *
 * La IA no inventa ejercicios: recibe, por cada día, candidatos ya filtrados por las reglas (equipo, lesiones,
 * nivel) y los rangos de series/reps/descanso del objetivo. Solo elige, ordena y escribe notas. La respuesta se valida
 * acá: ids que no estaban en los candidatos, repetidos o un formato distinto hacen que se rechace; los números fuera de
 * rango se ajustan al rango.
 */

export interface CandidatoIa {
  id: number
  nombre: string
  /** Patrón de movimiento (por ejemplo, "empuje-h") y si es compuesto. */
  patron: string
  compuesto: boolean
  equipo: string
  nivel: number
}

export interface DiaPedidoIa {
  tipo: string
  foco: string
  /** Ejercicios que eligió el motor por reglas (ids), como referencia. */
  base: number[]
  maxEjercicios: number
  candidatos: CandidatoIa[]
}

export interface Rango {
  series: [number, number]
  reps: [number, number]
  descanso: [number, number]
}

export interface PedidoIa {
  /** Solo lo necesario para elegir ejercicios: nada de nombre, correo, peso, edad ni respuestas de salud. */
  perfil: {
    objetivo: string
    experiencia: string
    lugar: string
    equipamiento: string[]
    diasPorSemana: number
    minutosPorSesion: number
    zonas: string[]
    lesiones: string[]
    precaucion: boolean
  }
  rangos: { compuesto: Rango; aislamiento: Rango }
  dias: DiaPedidoIa[]
}

export interface EjercicioIa {
  id: number
  sets: number
  reps: number
  restSeconds: number
  note: string
}

export interface DiaIa {
  dayName: string
  focus: string
  note: string
  exercises: EjercicioIa[]
}

/** Esquema de la respuesta (formato OpenAPI que entiende Gemini con `responseSchema`). */
export const ESQUEMA_RESPUESTA = {
  type: 'OBJECT',
  properties: {
    days: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          dayName: { type: 'STRING' },
          focus: { type: 'STRING' },
          note: { type: 'STRING' },
          exercises: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'INTEGER' },
                sets: { type: 'INTEGER' },
                reps: { type: 'INTEGER' },
                restSeconds: { type: 'INTEGER' },
                note: { type: 'STRING' },
              },
              required: ['id', 'sets', 'reps', 'restSeconds', 'note'],
            },
          },
        },
        required: ['dayName', 'focus', 'note', 'exercises'],
      },
    },
  },
  required: ['days'],
} as const

export function construirPrompt(pedido: PedidoIa): string {
  const { perfil, rangos } = pedido
  const rango = (r: Rango) => `${r.series[0]}–${r.series[1]} series de ${r.reps[0]}–${r.reps[1]} reps, descanso ${r.descanso[0]}–${r.descanso[1]} s`
  return [
    'Eres un entrenador personal certificado. Mejora un plan de entrenamiento de fuerza para esta persona.',
    `Perfil: objetivo ${perfil.objetivo}; experiencia ${perfil.experiencia}; entrena en ${perfil.lugar}` +
      (perfil.lugar !== 'gimnasio' ? ` con ${perfil.equipamiento.join(', ') || 'solo su peso corporal'}` : '') +
      `; ${perfil.diasPorSemana} días por semana de ${perfil.minutosPorSesion} minutos; quiere mejorar ${perfil.zonas.join(', ') || 'todo el cuerpo'}` +
      (perfil.lesiones.length ? `; lesiones o molestias en ${perfil.lesiones.join(', ')}` : '') +
      (perfil.precaucion ? '; tiene alguna alerta de salud: prefiere ejercicios simples y cargas moderadas' : '') +
      '.',
    'Reglas obligatorias:',
    '- Usa SOLO ejercicios de la lista de candidatos de cada día, con su id exacto. Nunca inventes ejercicios ni ids.',
    '- No repitas un ejercicio dentro del mismo día. Respeta el máximo de ejercicios por día.',
    '- Compuestos primero, aislamiento al final. Cubre los patrones principales del día antes que los accesorios.',
    `- Compuestos principales: ${rango(rangos.compuesto)}. Aislamiento y accesorios: ${rango(rangos.aislamiento)}.`,
    '- Varía un poco entre días del mismo tipo si hay opciones equivalentes, pero prioriza ejercicios básicos y conocidos.',
    '- Escribe en español de Chile, neutro y con tuteo (nada de voseo). dayName: corto (por ejemplo "Torso A").',
    '- focus: los grupos musculares del día, en una línea. note del día: una frase motivadora y concreta (máximo 140 caracteres).',
    '- note de cada ejercicio: una clave técnica breve (máximo 90 caracteres), o vacío.',
    'Responde solo con el JSON pedido, con un elemento en "days" por cada día y en el mismo orden.',
    '',
    'Días y candidatos (id | nombre | patrón | compuesto | equipo | nivel 1-3):',
    ...pedido.dias.map((d, i) =>
      [
        `Día ${i + 1} (${d.tipo}: ${d.foco}). Máximo ${d.maxEjercicios} ejercicios. Plan base por reglas: ${d.base.join(', ')}.`,
        ...d.candidatos.map((c) => `  ${c.id} | ${c.nombre} | ${c.patron} | ${c.compuesto ? 'sí' : 'no'} | ${c.equipo} | ${c.nivel}`),
      ].join('\n'),
    ),
  ].join('\n')
}

const ajustar = (n: unknown, [min, max]: [number, number]) => Math.min(max, Math.max(min, Math.round(Number(n))))
const texto = (t: unknown, max: number) => (typeof t === 'string' ? t.trim().slice(0, max) : '')

export type ResultadoValidacion = { ok: true; dias: DiaIa[] } | { ok: false; error: string }

/** Valida la respuesta de la IA contra el pedido. Los números fuera de rango se ajustan; lo demás, se rechaza. */
export function validarRespuesta(pedido: PedidoIa, respuesta: unknown): ResultadoValidacion {
  const dias = (respuesta as { days?: unknown })?.days
  if (!Array.isArray(dias)) return { ok: false, error: 'La respuesta no trae "days".' }
  if (dias.length !== pedido.dias.length) return { ok: false, error: `Se esperaban ${pedido.dias.length} días y llegaron ${dias.length}.` }
  const resultado: DiaIa[] = []
  for (const [i, dia] of dias.entries()) {
    const pedidoDia = pedido.dias[i]
    const porId = new Map(pedidoDia.candidatos.map((c) => [c.id, c]))
    const ejercicios = (dia as { exercises?: unknown })?.exercises
    if (!Array.isArray(ejercicios)) return { ok: false, error: `El día ${i + 1} no trae ejercicios.` }
    if (ejercicios.length < Math.min(3, pedidoDia.base.length) || ejercicios.length > pedidoDia.maxEjercicios)
      return { ok: false, error: `El día ${i + 1} trae ${ejercicios.length} ejercicios.` }
    const vistos = new Set<number>()
    const lista: EjercicioIa[] = []
    for (const e of ejercicios as Record<string, unknown>[]) {
      const id = Number(e?.id)
      const candidato = porId.get(id)
      if (!candidato) return { ok: false, error: `El día ${i + 1} usa un id que no estaba en los candidatos: ${String(e?.id)}.` }
      if (vistos.has(id)) return { ok: false, error: `El día ${i + 1} repite el ejercicio ${id}.` }
      vistos.add(id)
      const r = candidato.compuesto ? pedido.rangos.compuesto : pedido.rangos.aislamiento
      lista.push({ id, sets: ajustar(e.sets, r.series), reps: ajustar(e.reps, r.reps), restSeconds: ajustar(e.restSeconds, r.descanso), note: texto(e.note, 90) })
    }
    const d = dia as Record<string, unknown>
    resultado.push({ dayName: texto(d.dayName, 40), focus: texto(d.focus, 80), note: texto(d.note, 160), exercises: lista })
  }
  return { ok: true, dias: resultado }
}
