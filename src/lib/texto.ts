/** Minúsculas y sin tildes, para buscar y comparar nombres ("Bíceps" === "biceps"). */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function compararNombres(a: string, b: string): number {
  return a.localeCompare(b, 'es-CL', { sensitivity: 'base' })
}
