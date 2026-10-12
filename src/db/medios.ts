import { db } from '.'
import { normalizar } from '../lib/texto'
import type { MedioPropio } from '../types'

export async function agregarMedio(medio: Omit<MedioPropio, 'id' | 'creadoEn'>): Promise<void> {
  await db.medios.add({ ...medio, creadoEn: Date.now() })
}

export async function eliminarMedio(id: number): Promise<void> {
  await db.medios.delete(id)
}

/** Paquete para compartir solo las fotos y videos (sin tocar el resto de los datos de quien lo importa). */
interface PaqueteMedios {
  app: 'zanfit'
  tipo: 'medios'
  items: { ejercicio: string; tipo: 'foto' | 'video'; archivo: string; miniatura: string; mime: string }[]
}

function aBase64(blob: Blob): Promise<string> {
  return new Promise((ok, mal) => {
    const r = new FileReader()
    r.onload = () => ok(String(r.result).split(',')[1])
    r.onerror = () => mal(r.error)
    r.readAsDataURL(blob)
  })
}

function desdeBase64(b64: string, mime: string): Blob {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export async function exportarMedios(): Promise<{ texto: string; cantidad: number }> {
  const medios = await db.medios.toArray()
  const nombres = new Map((await db.exercises.bulkGet([...new Set(medios.map((m) => m.exerciseId))])).flatMap((e) => (e ? [[e.id!, e.nombre]] : [])))
  const items = await Promise.all(
    medios
      .filter((m) => nombres.has(m.exerciseId))
      .map(async (m) => ({
        ejercicio: nombres.get(m.exerciseId)!,
        tipo: m.tipo,
        mime: m.archivo.type,
        archivo: await aBase64(m.archivo),
        miniatura: await aBase64(m.miniatura),
      })),
  )
  const paquete: PaqueteMedios = { app: 'zanfit', tipo: 'medios', items }
  return { texto: JSON.stringify(paquete), cantidad: items.length }
}

/**
 * Suma las fotos y videos del paquete a los ejercicios con el mismo nombre. No borra nada. Omite los que ya estén
 * (mismo ejercicio, tipo y tamaño) y los de ejercicios que no existan en este teléfono.
 */
export async function importarMedios(texto: string): Promise<{ agregados: number; omitidos: number }> {
  let paquete: PaqueteMedios
  try {
    paquete = JSON.parse(texto)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  if (paquete?.app !== 'zanfit' || paquete.tipo !== 'medios' || !Array.isArray(paquete.items))
    throw new Error('Este archivo no es un paquete de fotos y videos de ZANFIT.')
  const porNombre = new Map((await db.exercises.toArray()).map((e) => [normalizar(e.nombre), e.id!]))
  let agregados = 0
  let omitidos = 0
  for (const item of paquete.items) {
    const exerciseId = porNombre.get(normalizar(item.ejercicio))
    if (exerciseId === undefined) {
      omitidos++
      continue
    }
    const archivo = desdeBase64(item.archivo, item.mime)
    const repetido = await db.medios.where('exerciseId').equals(exerciseId).filter((m) => m.tipo === item.tipo && m.archivo.size === archivo.size).first()
    if (repetido) {
      omitidos++
      continue
    }
    await agregarMedio({ exerciseId, tipo: item.tipo, archivo, miniatura: desdeBase64(item.miniatura, 'image/jpeg') })
    agregados++
  }
  return { agregados, omitidos }
}
