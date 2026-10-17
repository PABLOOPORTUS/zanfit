import { describe, expect, it } from 'vitest'
import { EJERCICIOS_BASE } from '../db/ejerciciosBase'
import { EJERCICIOS_EXTRA } from '../db/ejerciciosExtra'
import { caloriasEntreno } from './calorias'
import { camposCardio, distanciaKm, esCardio, metTrotadora, textoCardio } from './cardio'
import type { Exercise, WorkoutSet } from '../types'

const CATALOGO: Exercise[] = [...EJERCICIOS_BASE, ...EJERCICIOS_EXTRA].map((e, i) => ({ ...e, id: i + 1, propio: false }))
const porNombre = (n: string) => CATALOGO.find((e) => e.nombre === n)!
const tramo = (x: Partial<WorkoutSet>): WorkoutSet => ({ workoutId: 1, exerciseId: 1, numeroSerie: 1, peso: 0, reps: 0, completada: true, ...x })

describe('cardio', () => {
  it('la trotadora pide minutos, velocidad e inclinación; la bicicleta, minutos y nivel', () => {
    expect(camposCardio(porNombre('Caminata en trotadora'))).toEqual(['minutos', 'velocidad', 'inclinacion'])
    expect(camposCardio(porNombre('Bicicleta estática'))).toEqual(['minutos', 'nivel'])
    expect(camposCardio(porNombre('Saltar la cuerda'))).toEqual(['minutos'])
    expect(camposCardio(porNombre('Sentadilla'))).toBeNull()
    expect(esCardio({ nombre: 'Trotadora del gimnasio', propio: true })).toBe(true)
  })

  it('MET de la trotadora (ACSM): caminar en subida gasta más que en plano, y trotar más que caminar', () => {
    expect(metTrotadora(5, 0)).toBeCloseTo(3.4, 1)
    expect(metTrotadora(5, 10)).toBeGreaterThan(metTrotadora(5, 0) * 1.8)
    expect(metTrotadora(9, 0)).toBeGreaterThan(metTrotadora(6, 0))
  })

  it('calorías: 30 min caminando a 5,5 km/h con 8 % (70 kg) dan unas 250 kcal', () => {
    const kcal = caloriasEntreno(
      35 * 60_000,
      [{ ejercicio: porNombre('Caminata en trotadora'), series: 1, sets: [tramo({ minutos: 30, velocidad: 5.5, inclinacion: 8 })] }],
      70,
    )
    expect(kcal).toBeGreaterThan(220)
    expect(kcal).toBeLessThan(290)
  })

  it('texto y distancia', () => {
    expect(textoCardio({ minutos: 30, velocidad: 5.5, inclinacion: 8 })).toBe('30 min · 5,5 km/h · 8 %')
    expect(distanciaKm([{ minutos: 30, velocidad: 6 }])).toBeCloseTo(3)
  })
})
