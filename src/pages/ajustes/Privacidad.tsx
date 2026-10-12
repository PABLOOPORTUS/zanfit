import type { ReactNode } from 'react'
import BotonVolver from '../../components/BotonVolver'
import { AVISO_SALUD } from '../../lib/evaluacion'

/** `/ajustes/privacidad`: qué datos guarda ZANFIT, dónde y con quién se comparten. */
export default function Privacidad() {
  return (
    <section>
      <BotonVolver to="/ajustes">Ajustes</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl font-bold tracking-tight">Privacidad</h1>
      <p className="mt-2 text-texto-suave">Qué datos usa ZANFIT, dónde se guardan y con quién se comparten.</p>

      <Bloque titulo="Qué guardamos">
        Tu cuenta (correo, nombre y PIN cifrado), tu evaluación (sexo, edad, peso, altura, objetivo, experiencia, lugar, equipo, lesiones y
        respuestas de salud), tus rutinas, tus entrenos y tus ajustes. Las fotos y videos que grabes de tu gimnasio se guardan solo en tu teléfono.
      </Bloque>

      <Bloque titulo="Dónde se guardan">
        En tu teléfono y en una copia en la nube (Supabase), para que no pierdas nada si cambias de teléfono. Cada cuenta solo puede leer sus propios
        datos.
      </Bloque>

      <Bloque titulo="Inteligencia artificial">
        Al crear o ajustar tu plan, le enviamos a Gemini (Google) solo lo necesario para elegir ejercicios: tu objetivo, experiencia, lugar, equipo,
        días, minutos por sesión, zonas a mejorar, lesiones y si hubo alguna alerta de salud (sí o no). No enviamos tu nombre, correo, peso, edad ni
        tus respuestas de salud. En el plan gratuito de Gemini, Google puede usar lo enviado para mejorar sus servicios. Si no hay internet o la IA
        falla, el plan se arma solo con nuestras reglas, sin enviar nada.
      </Bloque>

      <Bloque titulo="Lo que no hacemos">No vendemos tus datos, no mostramos publicidad y no compartimos tu información con nadie más.</Bloque>

      <Bloque titulo="Tus datos son tuyos">
        Puedes descargar una copia de todo en Ajustes → Respaldo. Para borrar tu cuenta y tus datos de la nube, pídelo al administrador de ZANFIT.
      </Bloque>

      <Bloque titulo="Salud">{AVISO_SALUD}</Bloque>
    </section>
  )
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-borde bg-superficie p-4">
      <h2 className="font-semibold">{titulo}</h2>
      <p className="mt-1 leading-relaxed text-texto-suave">{children}</p>
    </div>
  )
}
