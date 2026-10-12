import BotonVolver from '../../components/BotonVolver'

export default function EjercicioNoEncontrado() {
  return (
    <section>
      <BotonVolver to="/ejercicios">Ejercicios</BotonVolver>
      <p className="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
        No encontramos este ejercicio.
      </p>
    </section>
  )
}
