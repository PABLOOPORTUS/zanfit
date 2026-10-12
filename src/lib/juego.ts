import { diaCumplido, ordenarEntrenos, recordsPorEntreno } from './logros'
import type { Routine, Workout, WorkoutSet } from '../types'

/**
 * Puntos y niveles. Como los logros, no se guardan: se calculan recorriendo el historial, así que funcionan con
 * entrenos antiguos y después de importar un respaldo.
 *
 * Puntos de cada entreno terminado: 10 por terminarlo, 1 por serie completada (máximo 30), 15 si era un día del plan,
 * 10 si completó todas las series de su rutina y 10 por cada récord.
 */

export interface Nivel {
  numero: number
  animal: string
  /** Archivo en public/medios/animales (`<archivo>.webp` animado y `<archivo>-quieto.webp`). */
  archivo: string
  /** Puntos desde los que se alcanza. */
  desde: number
  frase: string
}

/** Animales fuertes, de menor a mayor. Emojis animados de Google (Noto Emoji Animation, CC BY 4.0). */
export const NIVELES: Nivel[] = [
  { numero: 1, animal: 'Hormiga', archivo: 'hormiga', desde: 0, frase: 'Levanta 50 veces su peso. Todo empieza aquí.' },
  { numero: 2, animal: 'Zorro', archivo: 'zorro', desde: 100, frase: 'Astuto y constante: ya agarraste el ritmo.' },
  { numero: 3, animal: 'Lobo', archivo: 'lobo', desde: 250, frase: 'Disciplina de manada: no fallas a tus entrenos.' },
  { numero: 4, animal: 'Toro', archivo: 'toro', desde: 500, frase: 'Pura fuerza: nada te detiene.' },
  { numero: 5, animal: 'Oso', archivo: 'oso', desde: 900, frase: 'Potencia de verdad. Se nota el trabajo.' },
  { numero: 6, animal: 'Gorila', archivo: 'gorila', desde: 1500, frase: 'Fuerza bruta y control. Eres un ejemplo.' },
  { numero: 7, animal: 'León', archivo: 'leon', desde: 2500, frase: 'El rey del gimnasio.' },
  { numero: 8, animal: 'Dragón', archivo: 'dragon', desde: 4000, frase: 'Leyenda. Ya no eres de este mundo.' },
]

export interface DetallePuntos {
  total: number
  terminar: number
  series: number
  plan: number
  cumplido: number
  records: number
}

export interface ProgresoJuego {
  puntos: number
  nivel: Nivel
  siguiente: Nivel | null
  /** 0 a 1, avance hacia el siguiente nivel. */
  avance: number
  /** Puntos de cada entreno (por id). */
  porEntreno: Map<number, DetallePuntos>
}

export const nivelPara = (puntos: number): Nivel => [...NIVELES].reverse().find((n) => puntos >= n.desde) ?? NIVELES[0]

export function calcularJuego(workouts: Workout[], sets: WorkoutSet[], rutinasPlan: number[], rutinas: Routine[]): ProgresoJuego {
  const { ordenados, porWorkout } = ordenarEntrenos(workouts, sets)
  const records = recordsPorEntreno(ordenados, porWorkout)
  const porRutina = new Map(rutinas.map((r) => [r.id!, r]))
  const porEntreno = new Map<number, DetallePuntos>()
  let puntos = 0
  for (const w of ordenados) {
    const propios = porWorkout.get(w.id!) ?? []
    const d: DetallePuntos = {
      terminar: 10,
      series: Math.min(propios.length, 30),
      plan: w.routineId !== undefined && rutinasPlan.includes(w.routineId) ? 15 : 0,
      cumplido: diaCumplido(w, propios, porRutina) ? 10 : 0,
      records: (records.get(w.id!) ?? 0) * 10,
      total: 0,
    }
    d.total = d.terminar + d.series + d.plan + d.cumplido + d.records
    porEntreno.set(w.id!, d)
    puntos += d.total
  }
  const nivel = nivelPara(puntos)
  const siguiente = NIVELES.find((n) => n.desde > puntos) ?? null
  const avance = siguiente ? (puntos - nivel.desde) / (siguiente.desde - nivel.desde) : 1
  return { puntos, nivel, siguiente, avance, porEntreno }
}
