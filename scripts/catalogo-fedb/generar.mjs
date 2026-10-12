// Genera el catálogo completo desde free-exercise-db: fotos WebP, src/db/fichasEjercicios.ts y src/db/ejerciciosExtra.ts.
// Uso: node scripts/catalogo-fedb/generar.mjs <dir de trabajo> <raíz del proyecto>
//  - <dir de trabajo>: exercises.json (dist/exercises.json del repositorio) e img/<id>-0.jpg e img/<id>-1.jpg (exercises/<id>/0.jpg
//    y 1.jpg). Los ejercicios sin las dos fotos no entran.
//  - Necesita puppeteer-core, que no es dependencia del proyecto: `npm i --no-save puppeteer-core` antes de correrlo.
//  - Junto a este script: mapa.json (nombre del catálogo base -> id) y traducciones.json (id -> { nombre, instrucciones }).
//  - Convierte a WebP con canvas en Google Chrome. Con --sin-fotos solo regenera los archivos .ts.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [dir, proyecto] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const sinFotos = process.argv.includes('--sin-fotos')
const datos = JSON.parse(fs.readFileSync(`${dir}/exercises.json`, 'utf8'))
const aqui = new URL('.', import.meta.url).pathname
const mapa = JSON.parse(fs.readFileSync(`${aqui}/mapa.json`, 'utf8')) // nombre del catálogo base -> id
const trad = JSON.parse(fs.readFileSync(`${aqui}/traducciones.json`, 'utf8')) // id -> { nombre, instrucciones }
const NOTAS = {
  'Patada de glúteo en polea': 'En la foto: la patada en el suelo; en la polea, el tobillo va enganchado al cable y la rodilla casi recta.',
  'Encogimientos en máquina Smith': 'En la foto: con la barra por detrás; también se puede hacer con la barra frente a los muslos.',
}
const MUSCULO = { abdominals: 'abdominales', hamstrings: 'isquiotibiales', adductors: 'aductores', abductors: 'abductores', quadriceps: 'cuadriceps', biceps: 'biceps', shoulders: 'hombros', chest: 'pectorales', 'middle back': 'espalda-media', 'lower back': 'lumbares', lats: 'dorsales', triceps: 'triceps', traps: 'trapecios', forearms: 'antebrazos', neck: 'cuello', glutes: 'gluteos', calves: 'pantorrillas' }
const GRUPO = { abdominals: 'core', hamstrings: 'piernas', adductors: 'piernas', abductors: 'piernas', quadriceps: 'piernas', glutes: 'piernas', calves: 'piernas', biceps: 'biceps', shoulders: 'hombros', neck: 'hombros', chest: 'pecho', 'middle back': 'espalda', 'lower back': 'espalda', lats: 'espalda', traps: 'espalda', triceps: 'triceps', forearms: 'antebrazos' }
const EQUIPAMIENTO = { 'body only': 'peso-corporal', machine: 'maquina', other: 'otro', 'foam roll': 'rodillo', kettlebells: 'kettlebell', dumbbell: 'mancuernas', cable: 'polea', barbell: 'barra', bands: 'banda', 'medicine ball': 'balon-medicinal', 'exercise ball': 'fitball', 'e-z curl bar': 'barra-z' }
const CATEGORIA = { strength: 'fuerza', stretching: 'estiramiento', plyometrics: 'pliometria', strongman: 'strongman', powerlifting: 'powerlifting', cardio: 'cardio', 'olympic weightlifting': 'halterofilia' }
const NIVEL = { beginner: 'principiante', intermediate: 'intermedio', expert: 'avanzado' }
const MECANICA = { compound: 'compuesto', isolation: 'aislamiento' }
const FUERZA = { push: 'empuje', pull: 'tiron', static: 'estatico' }
const equipamientoDe = (e) => (e.equipment ? EQUIPAMIENTO[e.equipment] : 'ninguno')
const equipoDe = (e, nombre) => {
  if (/smith/i.test(e.id) || /smith/i.test(nombre)) return 'smith'
  const q = equipamientoDe(e)
  return q === 'barra-z' ? 'barra' : q === 'ninguno' ? 'peso-corporal' : q
}
const archivoDe = (id) => id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const conImagen = (id) => fs.existsSync(`${dir}/img/${id}-0.jpg`) && fs.existsSync(`${dir}/img/${id}-1.jpg`)

const porId = new Map(datos.map((e) => [e.id, e]))
const fichas = [] // [nombre, e]
for (const [nombre, id] of Object.entries(mapa)) fichas.push([nombre, porId.get(id)])
const usados = new Set(Object.values(mapa))
const extra = []
for (const e of datos) {
  if (usados.has(e.id) || !conImagen(e.id)) continue
  const t = trad[e.id]
  if (!t) throw new Error('Falta traducción: ' + e.id)
  fichas.push([t.nombre, e])
  extra.push({ nombre: t.nombre, grupoMuscular: GRUPO[e.primaryMuscles[0]], equipo: equipoDe(e, t.nombre), instrucciones: t.instrucciones })
}

// Fotos
if (!sinFotos) {
const salidaFotos = `${proyecto}/public/medios/fotos`
fs.rmSync(salidaFotos, { recursive: true, force: true })
fs.mkdirSync(salidaFotos, { recursive: true })
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage()
const convertir = (b64, lado, calidad, recorte) =>
  page.evaluate(async (b64, lado, calidad, recorte) => {
    const img = new Image(); img.src = 'data:image/jpeg;base64,' + b64; await img.decode()
    const c = document.createElement('canvas')
    if (recorte) {
      c.width = lado; c.height = Math.round(lado * 0.75)
      const e = Math.max(c.width / img.width, c.height / img.height), w = img.width * e, h = img.height * e
      c.getContext('2d').drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h)
    } else {
      const e = Math.min(1, lado / Math.max(img.width, img.height))
      c.width = Math.round(img.width * e); c.height = Math.round(img.height * e)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    }
    return c.toDataURL('image/webp', calidad).split(',')[1]
  }, b64, lado, calidad, recorte)
for (const [, e] of fichas) {
  const a = archivoDe(e.id)
  const [ini, fin] = [0, 1].map((n) => fs.readFileSync(`${dir}/img/${e.id}-${n}.jpg`).toString('base64'))
  fs.writeFileSync(`${salidaFotos}/${a}.webp`, Buffer.from(await convertir(ini, 800, 0.78, false), 'base64'))
  fs.writeFileSync(`${salidaFotos}/${a}-final.webp`, Buffer.from(await convertir(fin, 800, 0.78, false), 'base64'))
  fs.writeFileSync(`${salidaFotos}/${a}-mini.webp`, Buffer.from(await convertir(fin, 200, 0.7, true), 'base64'))
}
await browser.close()
console.log('fotos', fs.readdirSync(salidaFotos).length)
}

// fichasEjercicios.ts
const J = JSON.stringify
const lineaFicha = ([nombre, e]) => {
  const campos = [
    `archivo: ${J(archivoDe(e.id))}`,
    `id: ${J(e.id)}`,
    `principales: ${J(e.primaryMuscles.map((m) => MUSCULO[m]))}`,
    `secundarios: ${J(e.secondaryMuscles.map((m) => MUSCULO[m]).filter((m) => !e.primaryMuscles.map((p) => MUSCULO[p]).includes(m)))}`,
    `nivel: ${J(NIVEL[e.level])}`,
    `categoria: ${J(CATEGORIA[e.category])}`,
    `equipamiento: ${J(equipamientoDe(e))}`,
  ]
  if (e.mechanic) campos.push(`mecanica: ${J(MECANICA[e.mechanic])}`)
  if (e.force) campos.push(`fuerza: ${J(FUERZA[e.force])}`)
  if (NOTAS[nombre]) campos.push(`nota: ${J(NOTAS[nombre])}`)
  return `  ${J(nombre)}: { ${campos.join(', ')} },`
}
fs.writeFileSync(`${proyecto}/src/db/fichasEjercicios.ts`, `// GENERADO desde free-exercise-db (ver CLAUDE.md, "Recursos gráficos"). No editar a mano.
import type { Categoria, Equipamiento, Fuerza, Mecanica, Musculo, Nivel } from '../lib/musculos'

/**
 * Ficha de cada ejercicio del catálogo según free-exercise-db (github.com/yuhonas/free-exercise-db): fotos de inicio
 * (<archivo>.webp) y final (<archivo>-final.webp) de 800 px, miniatura 4:3 del final (<archivo>-mini.webp), músculos,
 * nivel, categoría y equipamiento. El repositorio las publica como dominio público (Unlicense), pero el origen de las
 * fotos no está verificado: ver CLAUDE.md.
 */
export interface Ficha {
  archivo: string
  /** Carpeta del ejercicio en free-exercise-db. */
  id: string
  principales: Musculo[]
  secundarios: Musculo[]
  nivel: Nivel
  categoria: Categoria
  equipamiento: Equipamiento
  mecanica?: Mecanica
  /** Tipo de movimiento: empuje, tirón o estático (isométrico). */
  fuerza?: Fuerza
  /** Aclaración cuando la foto muestra una variante (otro implemento o posición). */
  nota?: string
}

export const REPOSITORIO_FOTOS = 'https://github.com/yuhonas/free-exercise-db'
export const paginaFoto = (ficha: Ficha) => \`\${REPOSITORIO_FOTOS}/tree/main/exercises/\${ficha.id}\`

/** Por nombre del catálogo. */
export const FICHAS: Record<string, Ficha> = {
${fichas.map(lineaFicha).join('\n')}
}
`)

// ejerciciosExtra.ts
fs.writeFileSync(`${proyecto}/src/db/ejerciciosExtra.ts`, `// GENERADO desde free-exercise-db (nombres e instrucciones traducidos y resumidos). No editar a mano.
import type { Exercise } from '../types'

/** Ejercicios de free-exercise-db que se suman al catálogo base (db/ejerciciosBase.ts). Ver la v9 en db/index.ts. */
export const EJERCICIOS_EXTRA: Omit<Exercise, 'id' | 'propio'>[] = [
${extra.map((x) => `  { nombre: ${J(x.nombre)}, grupoMuscular: ${J(x.grupoMuscular)}, equipo: ${J(x.equipo)}, instrucciones: ${J(x.instrucciones)} },`).join('\n')}
]
`)
console.log('fichas', fichas.length, 'extra', extra.length)
