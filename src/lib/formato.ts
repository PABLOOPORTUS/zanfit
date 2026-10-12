import type { Unidad } from '../types'

export const LB_POR_KG = 2.20462262

/** kg (como se guarda) → número en la unidad elegida. */
export function aUnidad(kg: number, unidad: Unidad): number {
  return unidad === 'kg' ? kg : kg * LB_POR_KG
}

/** Número en la unidad elegida → kg (para guardar). */
export function aKg(valor: number, unidad: Unidad): number {
  return unidad === 'kg' ? valor : valor / LB_POR_KG
}
const fechaCorta = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' })
const fechaConAnio = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })

/** "62,5 kg" / "137,8 lb". Por defecto 2 decimales en kg y 1 en lb; los valores estimados (1RM) usan 1. */
export function formatearPeso(kg: number, unidad: Unidad = 'kg', decimales = unidad === 'kg' ? 2 : 1): string {
  const formato = new Intl.NumberFormat('es-CL', { maximumFractionDigits: decimales })
  return `${formato.format(aUnidad(kg, unidad))} ${unidad}`
}

/** "3 oct." si es de este año, "3 oct. 2025" si no. */
export function formatearFecha(timestamp: number): string {
  const fecha = new Date(timestamp)
  return (fecha.getFullYear() === new Date().getFullYear() ? fechaCorta : fechaConAnio).format(fecha)
}

const miles = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })
const fechaLarga = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
const hora = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' })

/** Volumen redondeado con separador de miles: "12.340 kg". */
export function formatearVolumen(kg: number, unidad: Unidad = 'kg'): string {
  return `${miles.format(aUnidad(kg, unidad))} ${unidad}`
}

/** "martes, 7 de octubre" (con mayúscula inicial). */
export function formatearFechaLarga(timestamp: number): string {
  const texto = fechaLarga.format(timestamp)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function formatearHora(timestamp: number): string {
  return hora.format(timestamp)
}

/** Cronómetro: "4:05", "1:02:09". */
export function formatearCronometro(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** Duración legible: "45 min", "1 h 05 min". */
export function formatearDuracion(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000))
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`
}

/** Descanso: "45 s", "1:30", "2 min". */
export function formatearDescanso(seg: number): string {
  if (seg < 60) return `${seg} s`
  if (seg % 60 === 0) return `${seg / 60} min`
  return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`
}

/** Convierte lo que escribe el usuario ("62,5") a número; vacío o inválido = 0. */
export function leerNumero(texto: string): number {
  const n = Number(texto.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}
