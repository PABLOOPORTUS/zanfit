import { useEffect, useState } from 'react'
import FondoAcceso from './FondoAcceso'
import Marca from './Marca'
import { DIRECCION, enDireccionAntigua } from '../lib/direccion'

const CLAVE = 'zanfit:mudanza-despues'

/**
 * En la dirección antigua (zanfit.vercel.app): "ZANFIT se cambió de dirección". Las cuentas y los datos están en la
 * nube, así que en la nueva solo hay que ingresar e instalar el ícono otra vez. Lleva sola a la nueva en 4 segundos
 * (nadie tiene que buscar un link). "Seguir aquí por ahora" lo evita en esta visita (por ejemplo, para exportar antes
 * las fotos y videos propios, que no se sincronizan).
 */
export default function AvisoMudanza() {
  const [despues, setDespues] = useState(() => {
    try {
      return sessionStorage.getItem(CLAVE) === '1'
    } catch {
      return false
    }
  })
  const activo = !despues && enDireccionAntigua()
  const destino = DIRECCION + location.pathname + location.search
  const [segundos, setSegundos] = useState(4)
  useEffect(() => {
    if (!activo) return
    if (segundos === 0) return location.replace(destino)
    const id = setTimeout(() => setSegundos((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [activo, segundos, destino])
  if (!activo) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-fondo">
      <main className="pt-safe pb-safe relative mx-auto min-h-dvh max-w-lg px-4">
        <FondoAcceso />
        <div className="pt-10 pb-6 text-center">
          <Marca tamano={88} />
        </div>
        <section className="animate-entrar rounded-2xl border border-lima/50 bg-fondo/85 p-5 backdrop-blur">
          <h1 className="font-marca text-3xl leading-tight font-semibold tracking-tight">ZANFIT se cambió de dirección</h1>
          <p className="mt-2 text-texto-suave">
            Ahora estamos en <span className="font-semibold text-texto select-all">{DIRECCION.replace('https://', '')}</span>. Tu cuenta, tus entrenos
            y tu plan te esperan allá: solo ingresa con tu correo y tu PIN.
          </p>
          <ol className="mt-4 flex flex-col gap-2 text-sm">
            <li>1. Toca el botón de abajo e ingresa con tu correo y PIN.</li>
            <li>2. Instala el ícono nuevo (la app te muestra cómo).</li>
            <li>3. Borra el ícono antiguo de ZANFIT.</li>
          </ol>
          <a
            href={destino}
            className="mt-5 flex h-13 items-center justify-center rounded-2xl bg-lima font-semibold text-fondo active:bg-lima-oscuro"
          >
            {segundos > 0 ? `Te llevamos en ${segundos}…` : 'Ir a la nueva dirección'}
          </a>
          <p className="mt-4 text-xs text-texto-suave">
            Si grabaste fotos o videos de tu gimnasio en la app, expórtalos antes en Ajustes → Fotos y videos de tu gimnasio: esos no se guardan en la
            nube.
          </p>
          <button
            type="button"
            onClick={() => {
              setDespues(true)
              try {
                sessionStorage.setItem(CLAVE, '1')
              } catch {
                // Sin sessionStorage vuelve a aparecer al recargar.
              }
            }}
            className="mt-2 h-11 w-full text-sm text-texto-suave underline underline-offset-4"
          >
            Seguir aquí por ahora
          </button>
        </section>
      </main>
    </div>
  )
}
