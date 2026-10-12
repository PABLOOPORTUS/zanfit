import { useEntrenoActivo } from '../../hooks/useWorkouts'
import ElegirEntreno from './ElegirEntreno'
import EntrenoActivo from './EntrenoActivo'

/** `/entrenar`: si hay un entreno en curso (aunque se haya cerrado la app), lo retoma; si no, deja elegir uno. */
export default function Entrenar() {
  const activo = useEntrenoActivo()
  if (activo === undefined) return null
  return activo ? <EntrenoActivo key={activo.id} workout={activo} /> : <ElegirEntreno />
}
