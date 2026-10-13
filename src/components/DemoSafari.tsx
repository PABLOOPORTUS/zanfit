import type { CSSProperties, ReactNode } from 'react'

/**
 * Animación que imita Safari en iPhone: 1) tocar Compartir, 2) tocar "Agregar a pantalla de inicio", 3) tocar
 * "Agregar". Cada pantalla dura 2,5 s y se repite. La gente copia lo que ve sin leer instrucciones.
 * Con "reducir movimiento" se ven las tres pantallas fijas, una al lado de la otra.
 */
export default function DemoSafari() {
  return (
    <div className="mx-auto w-56" aria-label="Toca Compartir, luego Agregar a pantalla de inicio y luego Agregar">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] border-4 border-borde bg-fondo motion-reduce:hidden">
        <Pantalla n={0} dedo={{ left: '50%', top: '91%' }} paso="1. Toca Compartir">
          <PaginaFalsa />
          <BarraSafari />
        </Pantalla>
        <Pantalla n={1} dedo={{ left: '45%', top: '70%' }} paso="2. Agregar a pantalla de inicio">
          <PaginaFalsa />
          <HojaCompartir />
        </Pantalla>
        <Pantalla n={2} dedo={{ left: '84%', top: '15.5%' }} paso="3. Toca Agregar">
          <DialogoAgregar />
        </Pantalla>
      </div>
      <p className="mt-2 hidden text-center text-sm text-texto-suave motion-reduce:block">
        1. Compartir → 2. Agregar a pantalla de inicio → 3. Agregar
      </p>
    </div>
  )
}

function Pantalla({ n, dedo, paso, children }: { n: number; dedo: { left: string; top: string }; paso: string; children: ReactNode }) {
  // Retraso negativo: cada pantalla arranca en su punto del ciclo, así nunca hay dos visibles a la vez.
  const retraso: CSSProperties = { animationDelay: `${n === 0 ? 0 : -(7.5 - n * 2.5)}s` }
  return (
    <div className="absolute inset-0 animate-demo-pantalla" style={retraso}>
      {children}
      <span
        className="absolute size-9 animate-demo-dedo rounded-full border-2 border-white bg-white/50 shadow-lg"
        style={{ ...dedo, ...retraso }}
        aria-hidden
      />
      <span className="absolute inset-x-2 top-2 rounded-full bg-lima px-2 py-1 text-center text-[11px] font-bold text-fondo">{paso}</span>
    </div>
  )
}

/** La página de ZANFIT detrás (solo formas). */
function PaginaFalsa() {
  return (
    <div className="absolute inset-0 flex flex-col items-center gap-2 bg-fondo pt-12">
      <span className="font-marca text-lg font-bold text-lima">ZANFIT</span>
      <span className="h-3 w-24 rounded bg-borde" />
      <span className="mt-2 h-8 w-36 rounded-lg bg-superficie" />
      <span className="h-8 w-36 rounded-lg bg-superficie" />
      <span className="h-8 w-36 rounded-lg bg-lima/70" />
    </div>
  )
}

/** Barra inferior de Safari con el botón Compartir al centro. */
function BarraSafari() {
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[16%] items-center justify-around border-t border-borde bg-superficie px-3 text-azul-ios">
      <span className="text-lg">‹</span>
      <span className="text-lg opacity-40">›</span>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 3v12M8 7l4-4 4 4M6 11H5v10h14V11h-1" />
      </svg>
      <span className="text-sm">⧉</span>
      <span className="text-sm">···</span>
    </div>
  )
}

/** Hoja de Compartir con la opción "Agregar a pantalla de inicio" resaltada. */
function HojaCompartir() {
  const fila = (texto: string, destacada = false) => (
    <div
      className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[11px] ${destacada ? 'bg-lima/20 font-bold text-texto' : 'text-texto-suave'}`}
    >
      {texto}
      <span className={`size-3.5 rounded-sm border ${destacada ? 'border-texto' : 'border-texto-suave'}`} />
    </div>
  )
  return (
    <div className="absolute inset-x-0 bottom-0 h-[58%] rounded-t-2xl border-t border-borde bg-superficie p-2">
      <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-borde" />
      {fila('Copiar')}
      {fila('Agregar a favoritos')}
      {fila('Agregar a pantalla de inicio', true)}
      {fila('Buscar en la página')}
    </div>
  )
}

/** Diálogo final de iOS: el ícono ZF y el botón "Agregar" arriba a la derecha. */
function DialogoAgregar() {
  return (
    <div className="absolute inset-0 bg-superficie">
      <div className="flex items-center justify-between border-b border-borde px-3 pt-14 pb-2 text-[11px]">
        <span className="text-azul-ios">Cancelar</span>
        <span className="font-semibold">Agregar a inicio</span>
        <span className="font-bold text-azul-ios">Agregar</span>
      </div>
      <div className="mt-4 flex items-center gap-3 px-3">
        <img src="/icon-192.png" alt="" className="size-12 rounded-xl" />
        <span className="font-semibold">ZANFIT</span>
      </div>
    </div>
  )
}
