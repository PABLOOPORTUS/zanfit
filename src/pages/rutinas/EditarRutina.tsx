import { useParams } from 'react-router-dom'
import { useRoutine } from '../../hooks/useRoutines'
import FormularioRutina from './FormularioRutina'
import RutinaNoEncontrada from './RutinaNoEncontrada'

/** `/rutinas/:id/editar`. */
export default function EditarRutina() {
  const id = Number(useParams().id)
  const rutina = useRoutine(id)
  if (rutina === undefined) return null
  if (rutina === null) return <RutinaNoEncontrada />
  return <FormularioRutina key={id} id={id} inicial={rutina} />
}
