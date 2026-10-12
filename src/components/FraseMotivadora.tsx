import { useEffect, useState } from 'react'

const FRASES = ['Un día más fuerte.', 'La constancia gana.', 'Tu mejor marca te espera.', 'Hoy entrenas por ti.', 'Cada serie cuenta.', 'Más fuerte que ayer.']
const reducirMovimiento = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Frase que cambia cada 5 s (fija si el sistema pide reducir el movimiento). */
export default function FraseMotivadora() {
  const [indice, setIndice] = useState(0)
  useEffect(() => {
    if (reducirMovimiento()) return
    const id = setInterval(() => setIndice((i) => i + 1), 5000)
    return () => clearInterval(id)
  }, [])
  return (
    <p key={indice} className="mt-2 animate-subir-frase font-marca text-xl font-bold text-white drop-shadow-lg">
      {FRASES[indice % FRASES.length]}
    </p>
  )
}
