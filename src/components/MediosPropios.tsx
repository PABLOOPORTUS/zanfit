import { useRef, useState, type ChangeEvent } from 'react'
import { agregarMedio, eliminarMedio } from '../db/medios'
import { useMediosPropios, useUrlBlob } from '../hooks/useMedios'
import { procesarMedio } from '../lib/medios'
import type { Exercise, MedioPropio } from '../types'

/**
 * Fotos y videos propios de un ejercicio (la máquina real del gimnasio). Se guardan solo en este teléfono.
 * `compacto`: cuando todavía no hay ninguno, muestra solo la invitación a agregar uno.
 */
export default function MediosPropios({ ejercicio }: { ejercicio: Exercise }) {
  const medios = useMediosPropios(ejercicio.id)
  const [indice, setIndice] = useState(0)
  const [progreso, setProgreso] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  if (medios === undefined) return null
  const actual = medios[Math.min(indice, medios.length - 1)]

  async function elegir(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setError(null)
    setProgreso(0)
    try {
      const procesado = await procesarMedio(archivo, setProgreso)
      await agregarMedio({ exerciseId: ejercicio.id!, ...procesado })
      setIndice(0)
    } catch (err) {
      setError((err as Error).message || 'No se pudo guardar el archivo.')
    } finally {
      setProgreso(null)
    }
  }

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-3">
      {actual ? (
        <>
          <Visor medio={actual} nombre={ejercicio.nombre} />
          {medios.length > 1 && (
            <div className="sin-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {medios.map((m, i) => (
                <BotonMiniatura key={m.id} medio={m} activo={m.id === actual.id} onClick={() => setIndice(i)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="px-1 py-2 text-texto-suave">
          ¿Tu gimnasio tiene esta máquina? Graba un video corto o saca una foto para recordar cómo se usa. Se guarda solo en este teléfono.
        </p>
      )}

      {progreso !== null ? (
        <div className="mt-3 rounded-xl bg-fondo p-3" role="status">
          <p className="text-sm font-semibold">Preparando el archivo… {Math.round(progreso * 100)}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-borde">
            <div className="h-full bg-lima transition-[width]" style={{ width: `${progreso * 100}%` }} />
          </div>
        </div>
      ) : (
        <div className={`mt-3 grid gap-2 ${actual ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-lima/60 font-semibold text-lima active:bg-lima/10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            {actual ? 'Agregar otro' : 'Agregar foto o video'}
          </button>
          {actual &&
            (confirmando ? (
              <button
                type="button"
                onClick={async () => {
                  await eliminarMedio(actual.id!)
                  setConfirmando(false)
                  setIndice(0)
                }}
                className="h-14 rounded-xl bg-peligro font-bold text-fondo"
              >
                Sí, eliminar
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmando(true)} className="h-14 rounded-xl border border-borde font-semibold text-texto-suave active:bg-borde">
                Eliminar este
              </button>
            ))}
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-peligro" role="alert">
          {error}
        </p>
      )}
      <input ref={input} type="file" accept="image/*,video/*" onChange={elegir} className="hidden" aria-label="Elegir foto o video" />
    </div>
  )
}

function Visor({ medio, nombre }: { medio: MedioPropio; nombre: string }) {
  const url = useUrlBlob(medio.archivo)
  const portada = useUrlBlob(medio.miniatura)
  if (!url) return null
  return medio.tipo === 'video' ? (
    <video key={url} src={url} poster={portada} autoPlay muted loop playsInline controls className="max-h-[60vh] w-full rounded-xl bg-black object-contain" aria-label={`Video: ${nombre}`} />
  ) : (
    <img src={url} alt={`Foto: ${nombre}`} className="max-h-[60vh] w-full rounded-xl bg-black object-contain" />
  )
}

function BotonMiniatura({ medio, activo, onClick }: { medio: MedioPropio; activo: boolean; onClick: () => void }) {
  const url = useUrlBlob(medio.miniatura)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      aria-label={medio.tipo === 'video' ? 'Ver video' : 'Ver foto'}
      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${activo ? 'border-lima' : 'border-transparent'}`}
    >
      {url && <img src={url} alt="" className="size-full object-cover" />}
      {medio.tipo === 'video' && <span className="absolute right-1 bottom-0.5 text-xs font-bold text-white drop-shadow">▶</span>}
    </button>
  )
}
