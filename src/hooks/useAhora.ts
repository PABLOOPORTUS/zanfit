import { useEffect, useState } from 'react'

/** Timestamp actual que se actualiza cada `intervaloMs` (para cronómetros). */
export function useAhora(intervaloMs = 1000): number {
  const [ahora, setAhora] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), intervaloMs)
    return () => clearInterval(id)
  }, [intervaloMs])
  return ahora
}
