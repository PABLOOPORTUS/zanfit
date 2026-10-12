import { useSearchParams } from 'react-router-dom'
import type { DatosEjercicio } from '../../db/exercises'
import { esGrupoMuscular } from '../../lib/catalogos'
import FormularioEjercicio from './FormularioEjercicio'

/** `/ejercicios/nuevo` (acepta ?nombre= y ?grupo= para precargar). */
export default function NuevoEjercicio() {
  const [params] = useSearchParams()
  const grupo = params.get('grupo')
  const inicial: DatosEjercicio = {
    nombre: params.get('nombre') ?? '',
    grupoMuscular: esGrupoMuscular(grupo) ? grupo : 'pecho',
    equipo: 'barra',
    instrucciones: '',
  }
  return <FormularioEjercicio inicial={inicial} />
}
