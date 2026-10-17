import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import SelectorOpciones from '../../components/SelectorOpciones'
import { actualizarEjercicio, crearEjercicio, existeNombre, type DatosEjercicio } from '../../db/exercises'
import { EQUIPOS, GRUPOS_MUSCULARES } from '../../lib/catalogos'
import type { Equipo, GrupoMuscular } from '../../types'

/** Formulario compartido por NuevoEjercicio (sin `id`) y EditarEjercicio (con `id`). */
export default function FormularioEjercicio({ id, inicial }: { id?: number; inicial: DatosEjercicio }) {
  const navigate = useNavigate()
  const location = useLocation()
  const esNuevo = id === undefined
  const [nombre, setNombre] = useState(inicial.nombre)
  const [grupo, setGrupo] = useState<GrupoMuscular>(inicial.grupoMuscular)
  const [equipo, setEquipo] = useState<Equipo>(inicial.equipo)
  const [instrucciones, setInstrucciones] = useState(inicial.instrucciones ?? '')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('Escribe un nombre para el ejercicio.')
      return
    }
    setGuardando(true)
    if (await existeNombre(nombre, id)) {
      setError('Ya existe un ejercicio con ese nombre.')
      setGuardando(false)
      return
    }
    const datos = { nombre, grupoMuscular: grupo, equipo, instrucciones }
    if (esNuevo) {
      const nuevoId = await crearEjercicio(datos)
      navigate(`/ejercicios/${nuevoId}`, { replace: true })
    } else {
      await actualizarEjercicio(id, datos)
      // Volver al detalle sin dejar el formulario en el historial; si se entró directo por URL, reemplazar.
      if (location.key !== 'default') navigate(-1)
      else navigate(`/ejercicios/${id}`, { replace: true })
    }
  }

  return (
    <section>
      {esNuevo ? (
        <BotonVolver to="/ejercicios">Ejercicios</BotonVolver>
      ) : (
        <BotonVolver to={`/ejercicios/${id}`}>{inicial.nombre}</BotonVolver>
      )}
      <h1 className="mt-2 font-marca text-3xl font-semibold tracking-tight">{esNuevo ? 'Nuevo ejercicio' : 'Editar ejercicio'}</h1>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6" noValidate>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Nombre</span>
          <input
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              setError(null)
            }}
            autoFocus={esNuevo && !inicial.nombre}
            autoCapitalize="sentences"
            enterKeyHint="done"
            placeholder="Ej: Remo en máquina"
            aria-invalid={error !== null}
            className={`h-12 rounded-2xl border bg-superficie px-4 text-base placeholder:text-texto-suave focus:outline-none ${
              error ? 'border-peligro' : 'border-borde focus:border-lima'
            }`}
          />
          {error && (
            <span className="text-peligro" role="alert">
              {error}
            </span>
          )}
        </label>

        <SelectorOpciones leyenda="Grupo muscular" opciones={GRUPOS_MUSCULARES} valor={grupo} onChange={setGrupo} />
        <SelectorOpciones leyenda="Equipo" opciones={EQUIPOS} valor={equipo} onChange={setEquipo} columnas={2} />

        <label className="flex flex-col gap-2">
          <span className="font-semibold">
            Instrucciones <span className="font-normal text-texto-suave">(opcional)</span>
          </span>
          <textarea
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
            rows={4}
            placeholder="Ej: asiento en la posición 4, agarre neutro, bajar lento"
            className="rounded-2xl border border-borde bg-superficie px-4 py-3 text-base placeholder:text-texto-suave focus:border-lima focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={guardando}
          className="h-13 rounded-2xl bg-lima font-semibold text-fondo active:bg-lima-oscuro disabled:opacity-60"
        >
          {esNuevo ? 'Crear ejercicio' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  )
}
