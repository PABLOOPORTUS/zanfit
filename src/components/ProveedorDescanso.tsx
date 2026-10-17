import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DescansoContext, type Descanso, type DescansoApi } from '../contexts/DescansoContext'
import { formatearCronometro } from '../lib/formato'
import { prepararAudio, sonarFinDescanso, vibrar } from '../lib/sonido'

const CLAVE = 'zanfit:descanso'
/** Si el descanso terminó hace más que esto (app en segundo plano o cerrada), se descarta sin sonar. */
const TOLERANCIA_AVISO_MS = 5000

function leerGuardado(): Descanso | null {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as Descanso | null
    return guardado && guardado.fin > Date.now() ? guardado : null
  } catch {
    return null
  }
}

function guardar(descanso: Descanso | null) {
  try {
    if (descanso) localStorage.setItem(CLAVE, JSON.stringify(descanso))
    else localStorage.removeItem(CLAVE)
  } catch {
    // Sin localStorage el temporizador funciona igual; solo no sobrevive a cerrar la app.
  }
}

/** Temporizador de descanso global: sigue corriendo al cambiar de tab y muestra la barra flotante. */
export default function ProveedorDescanso({ children }: { children: ReactNode }) {
  const [descanso, setDescansoEstado] = useState<Descanso | null>(leerGuardado)
  const [ahora, setAhora] = useState(Date.now)
  const [terminado, setTerminado] = useState(false)

  const setDescanso = useCallback((d: Descanso | null) => {
    guardar(d)
    setDescansoEstado(d)
  }, [])

  useEffect(() => {
    if (!descanso) return
    const intervalo = setInterval(() => {
      const t = Date.now()
      setAhora(t)
      if (t >= descanso.fin) {
        setDescanso(null)
        if (t - descanso.fin < TOLERANCIA_AVISO_MS) {
          vibrar()
          sonarFinDescanso()
          setTerminado(true)
        }
      }
    }, 250)
    return () => clearInterval(intervalo)
  }, [descanso, setDescanso])

  useEffect(() => {
    if (!terminado) return
    const t = setTimeout(() => setTerminado(false), 4000)
    return () => clearTimeout(t)
  }, [terminado])

  const api = useMemo<DescansoApi>(
    () => ({
      descanso,
      iniciar: (segundos) => {
        prepararAudio()
        setTerminado(false)
        setAhora(Date.now())
        setDescanso({ fin: Date.now() + segundos * 1000, total: segundos * 1000 })
      },
      sumar: (segundos) => {
        if (descanso) setDescanso({ fin: descanso.fin + segundos * 1000, total: descanso.total + segundos * 1000 })
      },
      saltar: () => setDescanso(null),
    }),
    [descanso, setDescanso],
  )

  return (
    <DescansoContext.Provider value={api}>
      {children}
      {(descanso || terminado) && (
        <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-30 mx-auto max-w-lg px-3">
          <div className="overflow-hidden rounded-2xl border border-lima/50 bg-superficie shadow-xl shadow-black/60" role="timer" aria-live="off">
            {descanso ? (
              <>
                <div className="h-1.5 bg-borde">
                  <div
                    className="h-full bg-lima transition-[width] duration-300 ease-linear"
                    style={{ width: `${Math.max(0, Math.min(100, ((descanso.fin - ahora) / descanso.total) * 100))}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 p-2 pl-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-texto-suave">Descanso</p>
                    <p className="font-marca text-3xl leading-none font-bold tabular-nums">
                      {formatearCronometro(Math.ceil((descanso.fin - ahora) / 1000) * 1000)}
                    </p>
                  </div>
                  <button type="button" onClick={() => api.sumar(15)} className="h-12 rounded-xl bg-borde px-4 font-semibold active:bg-texto-suave/40">
                    +15s
                  </button>
                  <button type="button" onClick={api.saltar} className="h-12 rounded-xl bg-lima px-4 font-semibold text-fondo active:bg-lima-oscuro">
                    Saltar
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => setTerminado(false)} className="flex h-13 w-full items-center justify-center bg-lima text-lg font-semibold text-fondo">
                ¡Descanso terminado! A la siguiente serie
              </button>
            )}
          </div>
        </div>
      )}
    </DescansoContext.Provider>
  )
}
