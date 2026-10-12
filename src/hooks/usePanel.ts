import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Panel a pantalla completa (p. ej. el selector de ejercicios) que se abre agregando una entrada al historial,
 * para que el botón atrás de Android/iOS lo cierre en vez de salir de la pantalla.
 * Como la ruta no cambia, la pantalla de abajo no se desmonta y conserva su estado (p. ej. un formulario sin guardar).
 */
export function usePanel(clave: string) {
  const location = useLocation()
  const navigate = useNavigate()
  const abierto = (location.state as Record<string, unknown> | null)?.[clave] === true
  return {
    abierto,
    abrir: () => navigate({ pathname: location.pathname, search: location.search }, { state: { [clave]: true } }),
    cerrar: () => navigate(-1),
  }
}
