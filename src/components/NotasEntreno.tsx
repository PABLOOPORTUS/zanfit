import { useState } from 'react'
import { guardarNotas } from '../db/workouts'

/** Notas del entreno; se guardan mientras escribes. */
export default function NotasEntreno({ workoutId, inicial }: { workoutId: number; inicial?: string }) {
  const [notas, setNotas] = useState(inicial ?? '')
  return (
    <label className="flex flex-col gap-2">
      <span className="font-semibold">
        Notas <span className="font-normal text-texto-suave">(opcional)</span>
      </span>
      <textarea
        value={notas}
        onChange={(e) => {
          setNotas(e.target.value)
          void guardarNotas(workoutId, e.target.value)
        }}
        rows={3}
        placeholder="¿Cómo te sentiste? Ej: dormí poco, subir peso en sentadilla la próxima"
        className="rounded-2xl border border-borde bg-superficie px-4 py-3 text-base placeholder:text-texto-suave focus:border-lima focus:outline-none"
      />
    </label>
  )
}
