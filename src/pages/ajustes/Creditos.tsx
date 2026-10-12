import type { ReactNode } from 'react'
import BotonVolver from '../../components/BotonVolver'
import { REPOSITORIO_FOTOS } from '../../db/fichasEjercicios'

/** `/ajustes/creditos`: fuentes y licencias de los recursos de terceros. */
export default function Creditos() {
  return (
    <section>
      <BotonVolver to="/ajustes">Ajustes</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl font-bold tracking-tight">Créditos</h1>
      <p className="mt-2 text-texto-suave">Recursos de terceros que usa ZANFIT. Gracias a sus autores.</p>

      <Bloque titulo="Fotos de los ejercicios">
        Fotos y datos de los ejercicios (músculos, nivel y equipamiento) de <Enlace href={REPOSITORIO_FOTOS}>free-exercise-db</Enlace>, que los
        publica como dominio público (Unlicense).
        <Cambios>Cambios en ZANFIT: tamaño reducido, formato WebP y una versión recortada para miniaturas.</Cambios>
      </Bloque>

      <Bloque titulo="Animales y emojis animados">
        Animales de los niveles, fuego y brazo: <Enlace href="https://googlefonts.github.io/noto-emoji-animation/">Noto Emoji Animation</Enlace> de
        Google, licencia <Enlace href="https://creativecommons.org/licenses/by/4.0/deed.es">CC BY 4.0</Enlace>.
        <Cambios>Cambios en ZANFIT: versiones quietas de 160 px para las listas.</Cambios>
      </Bloque>

      <Bloque titulo="Mapa muscular">
        Silueta de <Enlace href="https://github.com/GV79/react-body-highlighter">react-body-highlighter</Enlace>, licencia MIT.
        <Cambios>Cambios en ZANFIT: colores adaptados al modo oscuro.</Cambios>
      </Bloque>

      <Bloque titulo="Videos de la pantalla de acceso">
        Videos de <Enlace href="https://mixkit.co">Mixkit</Enlace>, con su licencia «Stock Video Free» (uso libre, también comercial).
        <Cambios>Cambios en ZANFIT: recortados a 8 segundos y comprimidos.</Cambios>
      </Bloque>

      <p className="mt-6 text-sm text-texto-suave">
        Las instrucciones de los ejercicios son resúmenes en español hechos para ZANFIT a partir de las de free-exercise-db.
      </p>
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

function Cambios({ children }: { children: string }) {
  return <span className="mt-2 block text-sm">{children}</span>
}

function Enlace({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-lima underline decoration-lima/40 underline-offset-4">
      {children}
    </a>
  )
}
