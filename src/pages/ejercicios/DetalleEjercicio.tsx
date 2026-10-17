import type { ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import FotoMaquina from '../../components/FotoMaquina'
import MediosPropios from '../../components/MediosPropios'
import PestanasEjercicio, { type Pestana } from '../../components/PestanasEjercicio'
import ZonaEliminar from '../../components/ZonaEliminar'
import { mediosDe } from '../../db/mediosEjercicios'
import { eliminarEjercicio } from '../../db/exercises'
import { useExercise, useRegistroEjercicio, useUsosEjercicio } from '../../hooks/useExercises'
import { etiquetaEquipo, etiquetaGrupo } from '../../lib/catalogos'
import { CATEGORIAS, EQUIPAMIENTOS, NIVELES } from '../../lib/musculos'
import { useUnidad } from '../../hooks/useAjustes'
import { formatearFecha } from '../../lib/formato'
import { esCardio } from '../../lib/cardio'
import EjercicioNoEncontrado from './EjercicioNoEncontrado'

export default function DetalleEjercicio() {
  const id = Number(useParams().id)
  const ejercicio = useExercise(id)
  // La pestaña va en la URL (?pestana=) para que se mantenga al volver desde el progreso.
  const [params, setParams] = useSearchParams()
  const pestana = (['instrucciones', 'musculos', 'equipo'] as const).find((p) => p === params.get('pestana')) ?? 'instrucciones'
  const setPestana = (p: Pestana) => setParams(p === 'instrucciones' ? {} : { pestana: p }, { replace: true })

  if (ejercicio === undefined) return null
  if (ejercicio === null) return <EjercicioNoEncontrado />
  const medios = mediosDe(ejercicio)

  return (
    <section>
      <BotonVolver to="/ejercicios">Ejercicios</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl leading-tight font-semibold tracking-tight">{ejercicio.nombre}</h1>

      <div className="mt-3 flex flex-wrap gap-2">
        <Etiqueta>{etiquetaGrupo(ejercicio.grupoMuscular)}</Etiqueta>
        <Etiqueta>{medios.ficha ? EQUIPAMIENTOS[medios.ficha.equipamiento] : etiquetaEquipo(ejercicio.equipo)}</Etiqueta>
        {medios.ficha && <Etiqueta>{NIVELES[medios.ficha.nivel]}</Etiqueta>}
        {medios.ficha && medios.ficha.categoria !== 'fuerza' && <Etiqueta>{CATEGORIAS[medios.ficha.categoria]}</Etiqueta>}
        {ejercicio.propio && <Etiqueta destacada>Propio</Etiqueta>}
      </div>

      {medios.ficha && (
        <div className="mt-6">
          <FotoMaquina foto={medios.ficha} nombre={ejercicio.nombre} />
        </div>
      )}

      <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">En tu gimnasio</h2>
      <MediosPropios ejercicio={ejercicio} />

      <div className="mt-8">
        <PestanasEjercicio ejercicio={ejercicio} pestana={pestana} onCambiar={setPestana} />
      </div>

      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">Tu registro</h2>
      <Registro id={id} cardio={esCardio(ejercicio)} />

      {ejercicio.propio ? (
        <>
          <Link
            to={`/ejercicios/${id}/editar`}
            className="mt-8 flex h-12 items-center justify-center rounded-2xl bg-superficie font-semibold active:bg-borde"
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

function Registro({ id, cardio }: { id: number; cardio: boolean }) {
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
  // El cardio no tiene peso: tiempo total y veces, sin gráficos de progreso.
  if (cardio)
    return (
      <dl className="grid grid-cols-3 gap-2">
        <Dato titulo="Tiempo total" valor={`${new Intl.NumberFormat('es-CL').format(registro.minutos)} min`} />
        <Dato titulo="Tramos" valor={String(registro.seriesCompletadas)} />
        <Dato titulo="Última vez" valor={registro.ultimaVez !== null ? formatearFecha(registro.ultimaVez) : '—'} />
      </dl>
    )
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
    <div className="rounded-2xl bg-superficie p-3">
      <dt className="text-xs text-texto-suave">{titulo}</dt>
      <dd className="mt-1 font-marca text-xl font-semibold">{valor}</dd>
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
