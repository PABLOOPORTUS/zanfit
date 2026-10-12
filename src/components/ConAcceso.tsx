import { useCallback, useEffect, useState, type ReactNode } from 'react'
import PantallaBloqueo from './PantallaBloqueo'
import { AccesoContext } from '../contexts/AccesoContext'
import { accesoGuardado, puedeUsar, revisarAcceso, type Acceso } from '../lib/acceso'

const CADA = 6 * 3_600_000

/**
 * Deja usar la app solo con la cuenta activa o en prueba vigente. Parte con lo guardado en el teléfono (sirve sin
 * internet) y lo revisa con la nube al abrir, al volver a la app y cada 6 horas. Si nunca se pudo revisar, deja pasar.
 */
export default function ConAcceso({ uid, children }: { uid: string; children: ReactNode }) {
  const [acceso, setAcceso] = useState<Acceso | null>(() => accesoGuardado(uid))
  const revisar = useCallback(async () => {
    const nuevo = await revisarAcceso(uid)
    if (nuevo) setAcceso(nuevo)
    return nuevo
  }, [uid])

  useEffect(() => {
    void revisar()
    const alVolver = () => document.visibilityState === 'visible' && void revisar()
    document.addEventListener('visibilitychange', alVolver)
    const id = setInterval(() => void revisar(), CADA)
    return () => {
      document.removeEventListener('visibilitychange', alVolver)
      clearInterval(id)
    }
  }, [revisar])

  if (acceso && !puedeUsar(acceso)) return <PantallaBloqueo acceso={acceso} onRevisar={revisar} />
  return <AccesoContext.Provider value={acceso}>{children}</AccesoContext.Provider>
}
