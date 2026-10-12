import { useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import SelectorOpciones from '../../components/SelectorOpciones'
import Stepper from '../../components/Stepper'
import ZonaEliminar from '../../components/ZonaEliminar'
import { guardarAjustes } from '../../db'
import { crearRespaldo, leerRespaldo, nombreArchivoRespaldo, restaurarRespaldo, type Respaldo } from '../../db/respaldo'
import { useAjustes } from '../../hooks/useAjustes'
import { useDescanso } from '../../hooks/useDescanso'
import { formatearDescanso, formatearFecha } from '../../lib/formato'
import type { Unidad } from '../../types'

const CLAVE_ULTIMO_RESPALDO = 'zanfit:ultimoRespaldo'
const UNIDADES: { valor: Unidad; etiqueta: string }[] = [
  { valor: 'kg', etiqueta: 'Kilos (kg)' },
  { valor: 'lb', etiqueta: 'Libras (lb)' },
]

function leerUltimoRespaldo(): number | null {
  try {
    return Number(localStorage.getItem(CLAVE_ULTIMO_RESPALDO)) || null
  } catch {
    return null
  }
}

/** `/ajustes`: unidad, descanso por defecto y respaldo de datos. */
export default function Ajustes() {
  const ajustes = useAjustes()
  const descanso = useDescanso()
  // Estado local para no perder toques rápidos mientras se guarda en la base.
  const [descansoSeg, setDescansoSeg] = useState(ajustes.descansoPorDefectoSeg)
  const [ultimoRespaldo, setUltimoRespaldo] = useState(leerUltimoRespaldo)
  const [porImportar, setPorImportar] = useState<Respaldo | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const inputArchivo = useRef<HTMLInputElement>(null)

  async function exportar() {
    setMensaje(null)
    const nombre = nombreArchivoRespaldo()
    const archivo = new File([JSON.stringify(await crearRespaldo(), null, 2)], nombre, { type: 'application/json' })
    let compartido = false
    // En el teléfono, compartir permite guardarlo en Archivos/Drive o enviarlo por WhatsApp o correo.
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: 'Respaldo de ZANFIT' })
        compartido = true
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    if (!compartido) {
      const url = URL.createObjectURL(archivo)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = nombre
      enlace.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    try {
      localStorage.setItem(CLAVE_ULTIMO_RESPALDO, String(Date.now()))
    } catch {
      // Solo es un recordatorio.
    }
    setUltimoRespaldo(Date.now())
    setMensaje({ tipo: 'ok', texto: `Respaldo listo: ${nombre}` })
  }

  async function elegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setMensaje(null)
    try {
      setPorImportar(leerRespaldo(await archivo.text()))
    } catch (error) {
      setPorImportar(null)
      setMensaje({ tipo: 'error', texto: (error as Error).message })
    }
  }

  async function importar() {
    if (!porImportar) return
    try {
      await restaurarRespaldo(porImportar)
      descanso.saltar()
      setPorImportar(null)
      setMensaje({ tipo: 'ok', texto: 'Listo: tus datos se restauraron desde el respaldo.' })
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo restaurar el respaldo. Tus datos no cambiaron.' })
    }
  }

  const d = porImportar?.datos

  return (
    <section className="flex flex-col gap-8">
      <h1 className="font-marca text-3xl font-bold tracking-tight">Ajustes</h1>

      <SelectorOpciones leyenda="Unidad de peso" opciones={UNIDADES} valor={ajustes.unidad} onChange={(unidad) => guardarAjustes({ unidad })} columnas={2} />

      <div>
        <Stepper
          etiqueta="Descanso por defecto"
          valor={descansoSeg}
          min={15}
          max={600}
          paso={15}
          formato={formatearDescanso}
          onChange={(f) =>
            setDescansoSeg((v) => {
              const nuevo = f(v)
              void guardarAjustes({ descansoPorDefectoSeg: nuevo })
              return nuevo
            })
          }
        />
        <p className="mt-2 text-sm text-texto-suave">Se usa en los entrenos libres y al agregar ejercicios a una rutina.</p>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Respaldo de datos</h2>
        <p className="text-texto-suave">
          Tus datos se guardan solo en este teléfono. Si borras la app o cambias de teléfono, se pierden: exporta un respaldo de vez en cuando y
          guárdalo en tu nube o envíatelo.
        </p>
        <p className="mt-2 text-sm text-texto-suave">{ultimoRespaldo ? `Último respaldo: ${formatearFecha(ultimoRespaldo)}` : 'Todavía no has exportado un respaldo.'}</p>

        <div className="mt-4 flex flex-col gap-3">
          <button type="button" onClick={exportar} className="h-16 rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro">
            Exportar respaldo
          </button>
          <button
            type="button"
            onClick={() => inputArchivo.current?.click()}
            className="h-14 rounded-2xl border border-borde bg-superficie font-semibold active:bg-borde"
          >
            Importar respaldo
          </button>
          <input ref={inputArchivo} type="file" accept="application/json,.json" onChange={elegirArchivo} className="hidden" aria-label="Archivo de respaldo" />
        </div>

        {mensaje && (
          <p role={mensaje.tipo === 'error' ? 'alert' : 'status'} className={`mt-3 ${mensaje.tipo === 'error' ? 'text-peligro' : 'text-lima'}`}>
            {mensaje.texto}
          </p>
        )}

        {d && (
          <div className="mt-4 rounded-2xl border border-borde bg-superficie p-4">
            <p className="font-semibold">Respaldo{porImportar.exportadoEn ? ` del ${formatearFecha(porImportar.exportadoEn)}` : ''}</p>
            <p className="mt-1 text-texto-suave">
              {contar(d.exercises.length, 'ejercicio', 'ejercicios')}, {contar(d.routines.length, 'rutina', 'rutinas')} y{' '}
              {contar(d.workouts.length, 'entreno', 'entrenos')}.
            </p>
            <div className="mt-4">
              <ZonaEliminar
                key={porImportar.exportadoEn}
                boton="Reemplazar mis datos con este respaldo"
                pregunta="¿Reemplazar todos tus datos?"
                detalle="Lo que tienes ahora en el teléfono se borra y queda lo del respaldo."
                textoConfirmar="Sí, reemplazar"
                onEliminar={importar}
              />
            </div>
          </div>
        )}
      </div>

      <Link to="/plan" className="flex h-14 items-center justify-between rounded-2xl border border-borde bg-superficie px-4 font-semibold active:bg-borde">
        Mi evaluación y plan
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-texto-suave" aria-hidden>
          <path d="m9 6 6 6-6 6" />
        </svg>
      </Link>

      <Link to="/ajustes/creditos" className="flex h-14 items-center justify-between rounded-2xl border border-borde bg-superficie px-4 font-semibold active:bg-borde">
        Créditos y licencias
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-texto-suave" aria-hidden>
          <path d="m9 6 6 6-6 6" />
        </svg>
      </Link>

      <p className="text-center text-sm text-texto-suave">ZANFIT · funciona sin conexión</p>
    </section>
  )
}

function contar(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`
}
