import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import ZonaEliminar from '../../components/ZonaEliminar'
import { eliminarEjercicio } from '../../db/exercises'
import { useExercise, useRegistroEjercicio, useUsosEjercicio } from '../../hooks/useExercises'
import { etiquetaEquipo, etiquetaGrupo } from '../../lib/catalogos'
import { useUnidad } from '../../hooks/useAjustes'
import { formatearFecha } from '../../lib/formato'
import EjercicioNoEncontrado from './EjercicioNoEncontrado'

export default function DetalleEjercicio() {
  const id = Number(useParams().id)
  const ejercicio = useExercise(id)

  if (ejercicio === undefined) return null
  if (ejercicio === null) return <EjercicioNoEncontrado />

  return (
    <section>
      <BotonVolver to="/ejercicios">Ejercicios</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl leading-tight font-bold tracking-tight">{ejercicio.nombre}</h1>

      <div className="mt-3 flex flex-wrap gap-2">
        <Etiqueta>{etiquetaGrupo(ejercicio.grupoMuscular)}</Etiqueta>
        <Etiqueta>{etiquetaEquipo(ejercicio.equipo)}</Etiqueta>
        {ejercicio.propio && <Etiqueta destacada>Propio</Etiqueta>}
      </div>

      <h2 className="mt-8 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">Cómo se hace</h2>
      <div className="rounded-2xl border border-borde bg-superficie p-4 text-lg leading-relaxed">
        {ejercicio.instrucciones ?? (
          <span className="text-texto-suave">
            Sin instrucciones. {ejercicio.propio && 'Puedes agregarlas editando el ejercicio.'}
          </span>
        )}
      </div>

      <h2 className="mt-8 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">Tu registro</h2>
      <Registro id={id} />

      {ejercicio.propio ? (
        <>
          <Link
            to={`/ejercicios/${id}/editar`}
            className="mt-8 flex h-14 items-center justify-center rounded-2xl border border-borde bg-superficie text-lg font-semibold active:bg-borde"
          >
            Editar ejercicio
          </Link>
          <EliminarEjercicio id={id} nombre={ejercicio.nombre} />
        </>
      ) : (
        <p className="mt-8 text-sm text-texto-suave">
          Los ejercicios del catálogo no se pueden editar. Si necesitas una variante, crea un ejercicio propio.
        </p>
      )}
    </section>
  )
}

function Registro({ id }: { id: number }) {
  const registro = useRegistroEjercicio(id)
  const u = useUnidad()
  if (registro === undefined) return null
  if (registro.seriesCompletadas === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-borde bg-superficie p-4 text-texto-suave">
        Todavía no registras series de este ejercicio.
      </p>
    )
  }
  return (
    <>
      <dl className="grid grid-cols-3 gap-2">
        <Dato titulo="Mejor peso" valor={registro.mejorPeso !== null ? u.peso(registro.mejorPeso) : '—'} />
        <Dato titulo="Series" valor={String(registro.seriesCompletadas)} />
        <Dato titulo="Última vez" valor={registro.ultimaVez !== null ? formatearFecha(registro.ultimaVez) : '—'} />
      </dl>
      <Link
        to={`/progreso/ejercicios/${id}`}
        className="mt-2 flex h-12 items-center justify-center rounded-2xl border border-borde font-semibold text-lima active:bg-borde"
      >
        Ver progreso
      </Link>
    </>
  )
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-3">
      <dt className="text-xs text-texto-suave">{titulo}</dt>
      <dd className="mt-1 font-marca text-xl font-bold">{valor}</dd>
    </div>
  )
}

function Etiqueta({ children, destacada = false }: { children: ReactNode; destacada?: boolean }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-sm font-semibold ${
        destacada ? 'border-lima/60 text-lima' : 'border-borde bg-superficie text-texto'
      }`}
    >
      {children}
    </span>
  )
}

function EliminarEjercicio({ id, nombre }: { id: number; nombre: string }) {
  const navigate = useNavigate()
  const usos = useUsosEjercicio(id)
  if (usos === undefined) return null
  const enUso = usos.rutinas + usos.entrenamientos > 0
  return (
    <div className="mt-3">
      <ZonaEliminar
        boton="Eliminar ejercicio"
        pregunta={`¿Eliminar «${nombre}»?`}
        bloqueo={enUso ? `No puedes eliminar este ejercicio porque está en ${describirUsos(usos)}.` : undefined}
        onEliminar={async () => {
          await eliminarEjercicio(id)
          navigate('/ejercicios', { replace: true })
        }}
      />
    </div>
  )
}

function describirUsos({ rutinas, entrenamientos }: { rutinas: number; entrenamientos: number }): string {
  const partes: string[] = []
  if (rutinas) partes.push(rutinas === 1 ? '1 rutina' : `${rutinas} rutinas`)
  if (entrenamientos) partes.push(entrenamientos === 1 ? '1 entrenamiento' : `${entrenamientos} entrenamientos`)
  return partes.join(' y ')
}
