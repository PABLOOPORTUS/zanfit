import { describe, expect, it } from 'vitest'
import { EJERCICIOS_BASE } from '../db/ejerciciosBase'
import { EJERCICIOS_EXTRA } from '../db/ejerciciosExtra'
import { caloriasEntreno, metDe } from './calorias'
import { calcularJuego, NIVELES, nivelPara } from './juego'
import { calcularLogros } from './logros'
import type { Exercise, Routine, Workout, WorkoutSet } from '../types'

const CATALOGO: Exercise[] = [...EJERCICIOS_BASE, ...EJERCICIOS_EXTRA].map((e, i) => ({ ...e, id: i + 1, propio: false }))
const porNombre = (n: string) => CATALOGO.find((e) => e.nombre === n)!

describe('calorías (MET)', () => {
  it('el cardio y la pliometría gastan más que las pesas, y los estiramientos menos', () => {
    const pesas = metDe(porNombre('Curl con barra'))
    expect(metDe(porNombre('Sentadilla'))).toBeGreaterThan(pesas)
    expect(metDe(porNombre('Trote en trotadora'))).toBeGreaterThan(metDe(porNombre('Sentadilla')))
    expect(metDe(porNombre('Estiramiento de isquiotibiales 90/90'))).toBeLessThan(pesas)
  })
  it('una hora de pesas para 70 kg da entre 250 y 400 kcal', () => {
    const kcal = caloriasEntreno(3_600_000, [{ ejercicio: porNombre('Sentadilla'), series: 4 }, { ejercicio: porNombre('Curl con barra'), series: 3 }], 70)
    expect(kcal).toBeGreaterThanOrEqual(250)
    expect(kcal).toBeLessThanOrEqual(400)
  })
  it('acota entrenos que quedaron abiertos (máximo 3 horas)', () => {
    const corto = caloriasEntreno(3 * 3_600_000, [{ ejercicio: porNombre('Sentadilla'), series: 4 }], 70)
    expect(caloriasEntreno(20 * 3_600_000, [{ ejercicio: porNombre('Sentadilla'), series: 4 }], 70)).toBe(corto)
  })
})

describe('puntos y niveles', () => {
  const rutina: Routine = { id: 1, nombre: 'Plan · Día A', ejercicios: [{ exerciseId: 1, seriesObjetivo: 3, repsObjetivo: 10, descansoSeg: 60 }] }
  const entreno = (id: number, peso: number, series = 3): { w: Workout; s: WorkoutSet[] } => ({
    w: { id, routineId: 1, nombre: 'x', fechaInicio: id * 1000, fechaFin: id * 1000 + 500 },
    s: Array.from({ length: series }, (_, i) => ({ workoutId: id, exerciseId: 1, numeroSerie: i + 1, reps: 10, peso, completada: true })),
  })

  it('suma terminar + series + día del plan + día cumplido + récords', () => {
    const a = entreno(1, 40)
    const b = entreno(2, 45) // récord
    const j = calcularJuego([a.w, b.w], [...a.s, ...b.s], [1], [rutina])
    expect(j.porEntreno.get(1)).toMatchObject({ terminar: 10, series: 3, plan: 15, cumplido: 10, records: 0, total: 38 })
    expect(j.porEntreno.get(2)).toMatchObject({ records: 10, total: 48 })
    expect(j.puntos).toBe(86)
  })
  it('sin completar la rutina no hay "día cumplido"', () => {
    const a = entreno(1, 40, 2)
    expect(calcularJuego([a.w], a.s, [1], [rutina]).porEntreno.get(1)!.cumplido).toBe(0)
  })
  it('los niveles van de Hormiga a Dragón y nivelPara elige el correcto', () => {
    expect(NIVELES[0].animal).toBe('Hormiga')
    expect(NIVELES.at(-1)!.animal).toBe('Dragón')
    expect(nivelPara(0).animal).toBe('Hormiga')
    expect(nivelPara(260).animal).toBe('Lobo')
    expect(nivelPara(99999).animal).toBe('Dragón')
  })
  it('el logro "Día cumplido" se desbloquea al completar todas las series', () => {
    const a = entreno(1, 40)
    const logro = calcularLogros([a.w], a.s, 0, [], [rutina]).find((l) => l.id === 'cumplidos-1')!
    expect(logro.desbloqueado?.workoutId).toBe(1)
  })
})
