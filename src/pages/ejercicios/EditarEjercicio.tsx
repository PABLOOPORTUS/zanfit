import { Navigate, useParams } from 'react-router-dom'
import { useExercise } from '../../hooks/useExercises'
import EjercicioNoEncontrado from './EjercicioNoEncontrado'
import FormularioEjercicio from './FormularioEjercicio'

/** `/ejercicios/:id/editar`. Solo para ejercicios propios. */
export default function EditarEjercicio() {
  const id = Number(useParams().id)
  const ejercicio = useExercise(id)
  if (ejercicio === undefined) return null
  if (ejercicio === null) return <EjercicioNoEncontrado />
  if (!ejercicio.propio) return <Navigate to={`/ejercicios/${id}`} replace />
  return <FormularioEjercicio key={id} id={id} inicial={ejercicio} />
}
