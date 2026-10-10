type Props = { titulo: string; mensaje: string }

export default function PantallaVacia({ titulo, mensaje }: Props) {
  return (
    <section>
      <h1 className="font-marca text-3xl font-bold tracking-tight">{titulo}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-texto-suave">
        {mensaje}
      </div>
    </section>
  )
}
