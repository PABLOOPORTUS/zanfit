import BotonVolver from '../../components/BotonVolver'

export default function RutinaNoEncontrada() {
  return (
    <section>
      <BotonVolver to="/rutinas">Rutinas</BotonVolver>
      <p className="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
        No encontramos esta rutina.
      </p>
    </section>
  )
}
