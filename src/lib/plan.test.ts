import { describe, expect, it } from 'vitest'
import { EJERCICIOS_BASE } from '../db/ejerciciosBase'
import { EJERCICIOS_EXTRA } from '../db/ejerciciosExtra'
import { clasificar, necesitaBarras } from './clasificacion'
import { alternativas, GRUPOS_TIPO, generarPlan, tieneEquipo, type PlanGenerado } from './plan'
import type { Exercise, Perfil } from '../types'

declare const process: { env: Record<string, string | undefined> }

const CATALOGO: Exercise[] = [...EJERCICIOS_BASE, ...EJERCICIOS_EXTRA].map((e, i) => ({ ...e, id: i + 1, propio: false }))
const porId = new Map(CATALOGO.map((e) => [e.id!, e]))
const anio = new Date().getFullYear()

const base: Perfil = {
  id: 'general',
  sexo: 'hombre',
  anioNacimiento: anio - 30,
  pesoKg: 75,
  alturaCm: 175,
  objetivo: 'musculo',
  zonas: ['general'],
  experiencia: 'intermedio',
  lugar: 'gimnasio',
  diasPorSemana: 4,
  minutosPorSesion: 60,
  lesiones: [],
  precaucion: false,
  actualizadoEn: 0,
}

export const PERFILES: Record<string, Perfil> = {
  'Principiante en casa, 3 días (mancuernas y banda)': {
    ...base,
    sexo: 'mujer',
    pesoKg: 62,
    experiencia: 'principiante',
    objetivo: 'grasa',
    lugar: 'casa',
    equipamiento: ['mancuernas', 'banda'],
    diasPorSemana: 3,
    minutosPorSesion: 45,
  },
  'Intermedio en gimnasio, 4 días': base,
  'Avanzado en gimnasio, 6 días, con lesión de hombro': {
    ...base,
    experiencia: 'avanzado',
    objetivo: 'fuerza',
    diasPorSemana: 6,
    minutosPorSesion: 90,
    lesiones: ['hombros'],
  },
}

const ejerciciosDe = (plan: PlanGenerado) => plan.dias.flatMap((d) => d.ejercicios.map((x) => porId.get(x.exerciseId)!))

describe('motor de rutinas por reglas', () => {
  for (const [nombre, perfil] of Object.entries(PERFILES)) {
    describe(nombre, () => {
      const plan = generarPlan(perfil, CATALOGO)

      it('arma un día por cada día de entrenamiento, con al menos 4 ejercicios y calentamiento', () => {
        expect(plan.dias).toHaveLength(perfil.diasPorSemana)
        for (const d of plan.dias) {
          expect(d.ejercicios.length).toBeGreaterThanOrEqual(4)
          expect(d.calentamiento.length).toBeGreaterThanOrEqual(3)
        }
      })

      it('no repite un ejercicio dentro del mismo día', () => {
        for (const d of plan.dias) expect(new Set(d.ejercicios.map((e) => e.exerciseId)).size).toBe(d.ejercicios.length)
      })

      it('usa solo ejercicios que puede hacer con su equipo', () => {
        for (const e of ejerciciosDe(plan)) expect(tieneEquipo(perfil, e), e.nombre).toBe(true)
      })

      it('excluye los ejercicios que cargan sus zonas lesionadas', () => {
        for (const e of ejerciciosDe(plan)) expect(clasificar(e)!.riesgos?.filter((r) => perfil.lesiones.includes(r)) ?? [], e.nombre).toEqual([])
      })

      it('pone los compuestos antes que los de aislamiento', () => {
        const compuestos = ['sentadilla', 'bisagra', 'empuje-h', 'empuje-v', 'tiron-v', 'tiron-h']
        for (const d of plan.dias) {
          const esCompuesto = d.ejercicios.map((x) => compuestos.includes(clasificar(porId.get(x.exerciseId)!)!.patron))
          expect(esCompuesto.indexOf(false) === -1 || esCompuesto.lastIndexOf(true) < esCompuesto.indexOf(false), d.nombre).toBe(true)
        }
      })

      it('en las divisiones por grupos no repite el grupo principal en días seguidos', () => {
        for (let i = 1; i < plan.dias.length; i++) {
          const [a, b] = [plan.dias[i - 1], plan.dias[i]]
          if (a.tipo === 'completo' && b.tipo === 'completo') continue
          if ((a.tipo === 'torso' && b.tipo === 'push') || (a.tipo === 'push' && b.tipo === 'torso')) continue
          const repetidos = GRUPOS_TIPO[a.tipo].filter((g) => GRUPOS_TIPO[b.tipo].includes(g))
          expect(repetidos, `${a.nombre} → ${b.nombre}`).toEqual([])
        }
      })
    })
  }

  it('principiante en casa: sin máquinas, poleas ni Smith', () => {
    const plan = generarPlan(PERFILES['Principiante en casa, 3 días (mancuernas y banda)'], CATALOGO)
    for (const e of ejerciciosDe(plan)) expect(['maquina', 'polea', 'smith', 'barra'], e.nombre).not.toContain(e.equipo)
  })

  it('lesión de hombro: sin press militar, press por sobre la cabeza ni fondos', () => {
    const plan = generarPlan(PERFILES['Avanzado en gimnasio, 6 días, con lesión de hombro'], CATALOGO)
    for (const e of ejerciciosDe(plan)) {
      expect(e.nombre, 'nada de press sobre la cabeza').not.toMatch(/press militar|press de hombros|press arnold|fondos|remo al mentón|tras la nuca/i)
      expect(clasificar(e)!.patron, e.nombre).not.toBe('empuje-v')
    }
  })

  it('solo peso corporal y sin barras: no usa dominadas ni fondos en paralelas', () => {
    const plan = generarPlan({ ...PERFILES['Principiante en casa, 3 días (mancuernas y banda)'], equipamiento: [] }, CATALOGO)
    for (const e of ejerciciosDe(plan)) {
      expect(e.equipo, e.nombre).toBe('peso-corporal')
      expect(necesitaBarras(e), e.nombre).toBe(false)
    }
  })

  it('las series y reps siguen al objetivo', () => {
    const fuerza = generarPlan(PERFILES['Avanzado en gimnasio, 6 días, con lesión de hombro'], CATALOGO).dias[0].ejercicios[0]
    expect(fuerza.repsObjetivo).toBeLessThanOrEqual(6)
    expect(fuerza.seriesObjetivo).toBeGreaterThanOrEqual(4)
    expect(fuerza.descansoSeg).toBeGreaterThanOrEqual(120)
    const grasa = generarPlan(PERFILES['Principiante en casa, 3 días (mancuernas y banda)'], CATALOGO).dias[0].ejercicios[0]
    expect(grasa.repsObjetivo).toBeGreaterThanOrEqual(12)
    expect(grasa.descansoSeg).toBeLessThanOrEqual(60)
  })
})

/** Para revisar a mano: `IMPRIMIR=1 npx vitest run src/lib/plan.test.ts` muestra los planes en texto. */
if (process.env.IMPRIMIR) {
  it('imprime los planes', () => {
    for (const [nombre, perfil] of Object.entries(PERFILES)) {
      const plan = generarPlan(perfil, CATALOGO)
      const lineas = [`\n=== ${nombre} (${plan.division}) ===`]
      for (const d of plan.dias) {
        lineas.push(`\n${d.nombre} — ${d.foco}`)
        lineas.push(`  Calentamiento: ${d.calentamiento.map((c) => `${porId.get(c.exerciseId)!.nombre} (${c.segundos} s)`).join(', ')}`)
        for (const x of d.ejercicios) {
          const e = porId.get(x.exerciseId)!
          lineas.push(`  • ${e.nombre} [${e.equipo}] ${x.seriesObjetivo}×${x.repsObjetivo}, descanso ${x.descansoSeg} s${x.pesoSugerido ? `, ~${x.pesoSugerido} kg` : ''}`)
        }
      }
      console.log(lineas.join('\n'))
    }
  })
}

describe('alternativas para cambiar un ejercicio', () => {
  const buscar = (nombre: string) => CATALOGO.find((e) => e.nombre === nombre)!
  const casa = PERFILES['Principiante en casa, 3 días (mancuernas y banda)']

  for (const nombre of ['Prensa de piernas', 'Jalón al pecho', 'Press de pecho en máquina', 'Press militar']) {
    it(`${nombre}: mismo movimiento, en el gimnasio y en la casa`, () => {
      const original = buscar(nombre)
      const patron = clasificar(original)!.patron
      const enGimnasio = alternativas(original, CATALOGO, base)
      expect(enGimnasio.length).toBeGreaterThanOrEqual(5)
      // Hay opciones con otro equipo (para cuando la máquina está ocupada).
      expect(enGimnasio.some((e) => e.equipo !== original.equipo)).toBe(true)
      for (const e of [...enGimnasio, ...alternativas(original, CATALOGO, casa)]) {
        expect(clasificar(e)?.patron, e.nombre).toBe(patron)
        expect(e.nombre).not.toBe(nombre)
      }
      for (const e of alternativas(original, CATALOGO, casa)) expect(tieneEquipo(casa, e), e.nombre).toBe(true)
    })
  }

  it('respeta las lesiones', () => {
    const conHombro = PERFILES['Avanzado en gimnasio, 6 días, con lesión de hombro']
    for (const e of alternativas(buscar('Press militar'), CATALOGO, conHombro)) expect(clasificar(e)?.riesgos ?? []).not.toContain('hombros')
  })

  if (process.env.IMPRIMIR)
    it('imprime ejemplos', () => {
      for (const nombre of ['Prensa de piernas', 'Jalón al pecho', 'Curl con barra', 'Press de pecho en máquina', 'Press militar'])
        console.log(nombre, '→', alternativas(buscar(nombre), CATALOGO, base).slice(0, 12).map((e) => `${e.nombre} [${e.equipo}]`))
    })
})
