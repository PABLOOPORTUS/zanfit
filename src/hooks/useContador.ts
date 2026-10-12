import { useEffect, useState } from 'react'

const reducirMovimiento = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Número que sube desde 0 hasta `valor` en `ms` (para resúmenes y puntos). Sin animación si se pide reducir movimiento. */
export function useContador(valor: number, ms = 1200, retraso = 0): number {
  const [actual, setActual] = useState(() => (reducirMovimiento() ? valor : 0))
  useEffect(() => {
    if (reducirMovimiento()) return setActual(valor)
    let cuadro = 0
    const inicio = performance.now() + retraso
    const paso = (ahora: number) => {
      const t = Math.min(1, Math.max(0, (ahora - inicio) / ms))
      setActual(Math.round(valor * (1 - (1 - t) ** 3)))
      if (t < 1) cuadro = requestAnimationFrame(paso)
    }
    cuadro = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(cuadro)
  }, [valor, ms, retraso])
  return actual
}
