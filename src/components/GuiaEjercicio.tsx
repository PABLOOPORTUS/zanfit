import { mediosDe } from '../db/mediosEjercicios'
import { etiquetaEquipo, etiquetaGrupo } from '../lib/catalogos'
import type { Exercise } from '../types'
import FotoMaquina from './FotoMaquina'
import MediosPropios from './MediosPropios'
import PestanasEjercicio from './PestanasEjercicio'

/** Guía a pantalla completa de un ejercicio (fotos, pasos y músculos). Ábrela con `usePanel` para que atrás la cierre. */
export default function GuiaEjercicio({ ejercicio, onCerrar }: { ejercicio: Exercise; onCerrar: () => void }) {
  const medios = mediosDe(ejercicio)
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-fondo" role="dialog" aria-modal="true" aria-label={`Cómo se hace: ${ejercicio.nombre}`}>
      <div className="pt-safe border-b border-borde">
        <div className="mx-auto flex min-h-12 max-w-lg items-center gap-2 px-4 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Cómo se hace</p>
            <h2 className="font-marca text-xl leading-tight font-semibold">{ejercicio.nombre}</h2>
          </div>
          <button type="button" onClick={onCerrar} className="h-12 shrink-0 rounded-xl bg-lima px-5 font-semibold text-fondo active:bg-lima-oscuro">
            Listo
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="pb-safe mx-auto flex max-w-lg flex-col gap-4 px-4 py-4">
          <p className="text-sm text-texto-suave">
            {etiquetaGrupo(ejercicio.grupoMuscular)} · {etiquetaEquipo(ejercicio.equipo)}
          </p>
          <MediosPropios ejercicio={ejercicio} />
          {medios.ficha && <FotoMaquina foto={medios.ficha} nombre={ejercicio.nombre} />}
          <PestanasEjercicio ejercicio={ejercicio} />
        </div>
      </div>
    </div>
  )
}
