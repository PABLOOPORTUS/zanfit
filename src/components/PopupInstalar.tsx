import { useState } from 'react'
import HojaInstalar from './HojaInstalar'
import { ofrecerInstalar } from '../lib/instalacion'

const CLAVE = 'zanfit:popup-instalar'
const leerCerrado = () => {
  try {
    return sessionStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

/**
 * Sobre el login, en cualquier teléfono donde la app no está instalada: Android con el botón de un toque, iPhone con
 * los 3 pasos y, dentro de Instagram o Facebook, cómo abrirla en el navegador. "Ahora no" lo oculta hasta la próxima visita;
 * después de entrenar (`<RecordatorioInstalar>`) y en Ajustes se puede volver a abrir.
 */
export default function PopupInstalar() {
  const [cerrado, setCerrado] = useState(leerCerrado)
  if (cerrado || !ofrecerInstalar()) return null
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
