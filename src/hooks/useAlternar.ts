import { useEffect, useState } from 'react'

const reducirMovimiento = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Alterna entre 0 y 1 cada `ms` para mostrar el inicio y el final de un ejercicio (fotos o dibujos).
 * Con `prefers-reduced-motion` o `activo` en falso se queda en 0.
 */
export function useAlternar(activo: boolean, ms = 1100): 0 | 1 {
  const [cuadro, setCuadro] = useState<0 | 1>(0)
  const animar = activo && !reducirMovimiento()

  useEffect(() => {
    if (!animar) return
    const id = setInterval(() => setCuadro((c) => (c === 0 ? 1 : 0)), ms)
    return () => clearInterval(id)
  }, [animar, ms])

  return animar ? cuadro : 0
}
