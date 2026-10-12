import type { ReactNode } from 'react'
import BotonVolver from '../../components/BotonVolver'
import { FOTOS } from '../../db/fotosEjercicios'

/** `/ajustes/creditos`: atribución de los recursos con licencia Creative Commons (lo exige CC BY-SA). */
export default function Creditos() {
  return (
    <section>
      <BotonVolver to="/ajustes">Ajustes</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl font-bold tracking-tight">Créditos</h1>
      <p className="mt-2 text-texto-suave">
        ZANFIT usa recursos gráficos libres del proyecto <Enlace href="https://wger.de">wger</Enlace>. Gracias a sus autores.
      </p>

      <Bloque titulo="Diagramas de músculos">
        Basados en «Muscular system» y «Muscular system-back» de <Enlace href="https://commons.wikimedia.org/wiki/File:Muscular_system.svg">Termininja</Enlace>{' '}
        (Wikimedia Commons), adaptados por el proyecto wger. Licencia{' '}
        <Enlace href="https://creativecommons.org/licenses/by-sa/3.0/deed.es">CC BY-SA 3.0</Enlace>.
        <Cambios>Cambios en ZANFIT: colores de los músculos (lima), silueta atenuada y archivos optimizados.</Cambios>
      </Bloque>

      <Bloque titulo="Dibujos de ejercicios">
        Dibujos de <Enlace href="https://github.com/everkinetic/data">Everkinetic</Enlace>, licencia{' '}
        <Enlace href="https://creativecommons.org/licenses/by-sa/4.0/deed.es">CC BY-SA 4.0</Enlace>. Dos de ellos (remo con barra y press de hombros
        con mancuernas) vienen de la copia publicada en wger, con licencia{' '}
        <Enlace href="https://creativecommons.org/licenses/by-sa/3.0/deed.es">CC BY-SA 3.0</Enlace>.
        <Cambios>Cambios en ZANFIT: colores adaptados al modo oscuro, archivos optimizados y, en los de wger, tamaño reducido y formato WebP.</Cambios>
      </Bloque>

      <Bloque titulo="Fotos de máquinas y ejercicios">
        Fotos con licencias libres de <Enlace href="https://commons.wikimedia.org">Wikimedia Commons</Enlace> y de Flickr (encontradas con{' '}
        <Enlace href="https://openverse.org">Openverse</Enlace>). Cada una indica su autor, su licencia y su fuente.
        <Cambios>Cambios en ZANFIT: tamaño reducido, formato WebP y una versión recortada para miniaturas.</Cambios>
      </Bloque>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {[...new Map(Object.entries(FOTOS).map(([ejercicio, f]) => [f.archivo, { ejercicio, ...f }])).values()].map((f) => (
          <li key={f.archivo} className="rounded-xl border border-borde bg-superficie px-3 py-2 leading-snug">
            <span className="font-semibold">{f.ejercicio}</span>
            <span className="block text-texto-suave">
              {f.autor || 'Autor desconocido'} · <Enlace href={f.pagina}>{f.licencia}</Enlace>
            </span>
          </li>
        ))}
      </ul>

      <Bloque titulo="Videos de la pantalla de acceso">
        Videos de <Enlace href="https://mixkit.co">Mixkit</Enlace>, con su licencia «Stock Video Free» (uso libre, también comercial).
        <Cambios>Cambios en ZANFIT: recortados a 8 segundos y comprimidos.</Cambios>
      </Bloque>

      <p className="mt-6 text-sm text-texto-suave">
        Las versiones adaptadas de estos recursos se comparten con la misma licencia que su original. Las instrucciones de los ejercicios y el resto de la
        app son propios de ZANFIT.
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
