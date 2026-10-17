import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import Avatar from './Avatar'
import Marca from './Marca'
import { useCuenta } from '../hooks/useCuenta'
import { usePerfil } from '../hooks/usePlan'

/** Pantallas que se pueden abrir sin haber hecho la evaluación (para salir de la cuenta o administrar). */
const SIN_EVALUACION = ['/evaluacion', '/ajustes', '/admin']

export default function Layout() {
  const { pathname } = useLocation()
  const { estado, ultimaSync } = useCuenta()
  const perfil = usePerfil()
  // Quien todavía no se evalúa parte directo en la evaluación, sin barra inferior. Se espera la primera
  // sincronización (o que no haya conexión) para no mandar ahí a quien ya tiene su evaluación en la nube.
  const sinEvaluar = perfil === null && (ultimaSync !== null || estado === 'sin-conexion' || estado === 'error')
  if (sinEvaluar && !SIN_EVALUACION.some((r) => pathname.startsWith(r))) return <Navigate to="/evaluacion" replace />
  const primeraEvaluacion = sinEvaluar && pathname.startsWith('/evaluacion')
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="pt-safe sticky top-0 z-10 border-b border-borde bg-fondo/90 backdrop-blur">
        <div className="flex h-14 items-center justify-between pl-4 pr-1">
          <span className="flex items-center gap-2.5">
            <Marca tamano={30} />
            <span className="font-marca text-sm font-semibold tracking-[0.2em] text-texto">ZANFIT</span>
          </span>
          <Link to="/ajustes" aria-label="Perfil y ajustes" className="flex size-12 items-center justify-center rounded-xl active:bg-superficie">
            <Avatar className="size-9 text-base" />
          </Link>
        </div>
      </header>
      <main className={`flex-1 px-4 pt-4 ${primeraEvaluacion ? 'pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]' : 'pb-28'}`}>
        {/* La clave fuerza a repetir la animación de entrada en cada pantalla. */}
        <div key={pathname} className="animate-entrar">
          <Outlet />
        </div>
      </main>
      {!primeraEvaluacion && <BottomNav />}
    </div>
  )
}
