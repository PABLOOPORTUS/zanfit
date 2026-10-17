import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import CambiarEjercicio from '../../components/CambiarEjercicio'
import SelectorEjercicios from '../../components/SelectorEjercicios'
import Stepper from '../../components/Stepper'
import { actualizarRutina, crearRutina, type DatosRutina } from '../../db/routines'
import { useAjustes } from '../../hooks/useAjustes'
import { useExercises } from '../../hooks/useExercises'
import { usePanel } from '../../hooks/usePanel'
import { usePerfil } from '../../hooks/usePlan'
import { formatearDescanso } from '../../lib/formato'
import { esCardio, objetivoPorDefecto } from '../../lib/cardio'
import { reemplazoEnRutina } from '../../lib/plan'
import type { RoutineExercise } from '../../types'

/** Formulario compartido por NuevaRutina (sin `id`) y EditarRutina (con `id`). */
export default function FormularioRutina({ id, inicial }: { id?: number; inicial: DatosRutina }) {
  const navigate = useNavigate()
  const location = useLocation()
  const selector = usePanel('selectorEjercicios')
  const ejercicios = useExercises()
  const perfil = usePerfil()
  const cambio = usePanel('cambiarEjercicio')
  const [cambiando, setCambiando] = useState<number | null>(null)
  const { descansoPorDefectoSeg } = useAjustes()
  const esNueva = id === undefined
  const [nombre, setNombre] = useState(inicial.nombre)
  const [items, setItems] = useState<RoutineExercise[]>(inicial.ejercicios)
  const [error, setError] = useState<string | null>(null)

  const porId = new Map((ejercicios ?? []).map((e) => [e.id!, e]))
  const cardio = (item: RoutineExercise) => {
    const e = porId.get(item.exerciseId)
    return !!e && esCardio(e)
  }

  type Campo = 'seriesObjetivo' | 'repsObjetivo' | 'descansoSeg'
  function cambiar(i: number, campo: Campo, actualizar: (anterior: number) => number) {
    setItems((actual) => actual.map((item, j) => (j === i ? { ...item, [campo]: actualizar(item[campo]) } : item)))
  }

  function mover(i: number, delta: -1 | 1) {
    setItems((actual) => {
      const copia = [...actual]
      ;[copia[i], copia[i + delta]] = [copia[i + delta], copia[i]]
      return copia
    })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return setError('Ponle un nombre a la rutina.')
    if (items.length === 0) return setError('Agrega al menos un ejercicio.')
    const datos = { nombre, ejercicios: items }
    if (esNueva) {
      const nuevoId = await crearRutina(datos)
      navigate(`/rutinas/${nuevoId}`, { replace: true })
    } else {
      await actualizarRutina(id, datos)
      if (location.key !== 'default') navigate(-1)
      else navigate(`/rutinas/${id}`, { replace: true })
    }
  }

  return (
    <section>
      {esNueva ? <BotonVolver to="/rutinas">Rutinas</BotonVolver> : <BotonVolver to={`/rutinas/${id}`}>{inicial.nombre}</BotonVolver>}
      <h1 className="mt-2 font-marca text-3xl font-bold tracking-tight">{esNueva ? 'Nueva rutina' : 'Editar rutina'}</h1>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6" noValidate>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Nombre</span>
          <input
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              setError(null)
            }}
            autoFocus={esNueva}
            autoCapitalize="sentences"
            enterKeyHint="done"
            placeholder="Ej: Torso A"
            className="h-12 rounded-2xl border border-borde bg-superficie px-4 text-base placeholder:text-texto-suave focus:border-lima focus:outline-none"
          />
        </label>

        <div>
          <p className="mb-2 font-semibold">Ejercicios</p>
          <ol className="flex flex-col gap-3">
            {items.map((item, i) => (
              <li key={item.exerciseId} className="rounded-2xl bg-superficie p-3">
                <div className="flex items-start gap-1">
                  <span className="w-6 shrink-0 pt-3 font-marca text-lg font-bold text-texto-suave">{i + 1}</span>
                  <p className="min-w-0 flex-1 pt-2.5 text-lg leading-snug font-semibold">
                    {porId.get(item.exerciseId)?.nombre ?? 'Ejercicio eliminado'}
                  </p>
                  <BotonIcono
                    etiqueta="Quitar"
                    onClick={() => setItems((actual) => actual.filter((_, j) => j !== i))}
                    d="M6 6l12 12M18 6 6 18"
                    peligro
                  />
                </div>
                {porId.has(item.exerciseId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCambiando(item.exerciseId)
                      cambio.abrir()
                    }}
                    className="mt-1 ml-6 flex h-11 items-center gap-1.5 rounded-xl px-1 font-semibold text-lima active:bg-lima/10"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
                    </svg>
                    Cambiar por otro
                  </button>
                )}
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Stepper
                    etiqueta={cardio(item) ? 'Tramos' : 'Series'}
                    valor={item.seriesObjetivo}
                    min={1}
                    max={10}
                    onChange={(f) => cambiar(i, 'seriesObjetivo', f)}
                  />
                  {cardio(item) ? (
                    <Stepper
                      etiqueta="Minutos"
                      valor={item.repsObjetivo}
                      min={1}
                      max={180}
                      paso={5}
                      onChange={(f) => cambiar(i, 'repsObjetivo', f)}
                    />
                  ) : (
                    <Stepper etiqueta="Reps" valor={item.repsObjetivo} min={1} max={50} onChange={(f) => cambiar(i, 'repsObjetivo', f)} />
                  )}
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <div className="min-w-0 flex-1">
                    <Stepper
                      etiqueta="Descanso"
                      valor={item.descansoSeg}
                      min={15}
                      max={600}
                      paso={15}
                      formato={formatearDescanso}
                      onChange={(f) => cambiar(i, 'descansoSeg', f)}
                    />
                  </div>
                  <div className="flex shrink-0 gap-1 border-l border-borde pl-2">
                    <BotonIcono etiqueta="Subir" onClick={() => mover(i, -1)} disabled={i === 0} d="m6 15 6-6 6 6" />
                    <BotonIcono etiqueta="Bajar" onClick={() => mover(i, 1)} disabled={i === items.length - 1} d="m6 9 6 6 6-6" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => {
              setError(null)
              selector.abrir()
            }}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-lima/60 font-semibold text-lima active:bg-lima/10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Agregar ejercicios
          </button>
        </div>

        {error && (
          <p className="text-peligro" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="h-13 rounded-2xl bg-lima font-bold text-fondo active:bg-lima-oscuro">
          {esNueva ? 'Crear rutina' : 'Guardar cambios'}
        </button>
      </form>

      {cambio.abierto && cambiando !== null && porId.get(cambiando) && (
        <CambiarEjercicio
          exercise={porId.get(cambiando)!}
          excluir={items.map((i) => i.exerciseId)}
          onCerrar={cambio.cerrar}
          onElegir={(nuevo) => {
            const ejercicio = porId.get(nuevo)
            if (ejercicio)
              setItems((actual) =>
                actual.map((item) => (item.exerciseId === cambiando ? reemplazoEnRutina(item, ejercicio, perfil, porId.get(cambiando)) : item)),
              )
            cambio.cerrar()
          }}
        />
      )}

      {selector.abierto && (
        <SelectorEjercicios
          excluir={items.map((i) => i.exerciseId)}
          onCerrar={selector.cerrar}
          onAgregar={(ids) => {
            setItems((actual) => [
              ...actual,
              ...ids.map((exerciseId) => ({ exerciseId, ...objetivoPorDefecto(porId.get(exerciseId)), descansoSeg: descansoPorDefectoSeg })),
            ])
            selector.cerrar()
          }}
        />
      )}
    </section>
  )
}

function BotonIcono({
  etiqueta,
  onClick,
  disabled,
  d,
  peligro,
}: {
  etiqueta: string
  onClick: () => void
  disabled?: boolean
  d: string
  peligro?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      className={`flex size-12 shrink-0 items-center justify-center rounded-xl active:bg-borde disabled:opacity-25 ${peligro ? 'text-peligro' : 'text-texto'}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={d} />
      </svg>
    </button>
  )
}
