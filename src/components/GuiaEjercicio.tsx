import { mediosDe } from '../db/mediosEjercicios'
import { etiquetaEquipo, etiquetaGrupo } from '../lib/catalogos'
import type { Exercise } from '../types'
import DiagramaMusculos from './DiagramaMusculos'
import DibujosEjercicio from './DibujosEjercicio'
import FotoMaquina from './FotoMaquina'
import MediosPropios from './MediosPropios'

/** Guía a pantalla completa de un ejercicio (dibujos, pasos y músculos). Ábrela con `usePanel` para que atrás la cierre. */
export default function GuiaEjercicio({ ejercicio, onCerrar }: { ejercicio: Exercise; onCerrar: () => void }) {
  const medios = mediosDe(ejercicio)
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-fondo" role="dialog" aria-modal="true" aria-label={`Cómo se hace: ${ejercicio.nombre}`}>
      <div className="pt-safe border-b border-borde">
        <div className="mx-auto flex min-h-14 max-w-lg items-center gap-2 px-4 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-wide text-texto-suave uppercase">Cómo se hace</p>
            <h2 className="font-marca text-xl leading-tight font-bold">{ejercicio.nombre}</h2>
          </div>
          <button type="button" onClick={onCerrar} className="h-12 shrink-0 rounded-xl bg-lima px-5 font-bold text-fondo active:bg-lima-oscuro">
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
          {medios.foto && <FotoMaquina foto={medios.foto} nombre={ejercicio.nombre} />}
          {medios.dibujos && !medios.foto && <DibujosEjercicio dibujos={medios.dibujos} nombre={ejercicio.nombre} />}
          <div className="rounded-2xl border border-borde bg-superficie p-4 text-lg leading-relaxed">
            {ejercicio.instrucciones ?? <span className="text-texto-suave">Este ejercicio no tiene instrucciones.</span>}
          </div>
          <DiagramaMusculos musculos={medios.musculos} />
        </div>
      </div>
    </div>
  )
}
