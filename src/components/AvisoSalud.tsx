import { AVISO_SALUD } from '../lib/evaluacion'

/** Aviso de que el plan no reemplaza a un profesional de la salud (inicio de la evaluación y pantalla del plan). */
export default function AvisoSalud() {
  return (
    <p className="rounded-2xl border border-borde bg-superficie p-4 text-sm leading-relaxed text-texto-suave" role="note">
      <span className="font-semibold text-texto">Importante: </span>
      {AVISO_SALUD}
    </p>
  )
}
