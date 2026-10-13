import { useState } from 'react'
import HojaInstalar from './HojaInstalar'
import { esInstalada, plataforma } from '../lib/instalacion'

const CLAVE = 'zanfit:popup-instalar'
const leerCerrado = () => {
  try {
    return sessionStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

/**
 * Sobre el login, solo en Android y si la app no está instalada: ahí instalar es un toque. En iPhone no se muestra al
 * entrar (son 3 pasos en Safari): pueden usarla en Safari y se les ofrece después del primer entreno
 * (`<RecordatorioInstalar>`). "Ahora no" lo oculta hasta la próxima visita.
 */
export default function PopupInstalar() {
  const [cerrado, setCerrado] = useState(leerCerrado)
  if (cerrado || plataforma() !== 'android' || esInstalada()) return null
  return (
    <HojaInstalar
      onCerrar={() => {
        setCerrado(true)
        try {
          sessionStorage.setItem(CLAVE, '1')
        } catch {
          // Sin sessionStorage vuelve a aparecer al recargar; no es grave.
        }
      }}
    />
  )
}
