import { esCodigoValido, normalizarCodigo } from '../../lib/codigos'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import FondoAcceso from '../../components/FondoAcceso'
import PopupInstalar from '../../components/PopupInstalar'
import FraseMotivadora from '../../components/FraseMotivadora'
import Marca from '../../components/Marca'
import { useCuenta } from '../../hooks/useCuenta'

const INTENTOS_MAXIMOS = 5
const BLOQUEO_MS = 60_000
const CLAVE_INTENTOS = 'zanfit:intentos'

function leerIntentos(): { cantidad: number; desde: number } {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_INTENTOS) ?? '') ?? { cantidad: 0, desde: 0 }
  } catch {
    return { cantidad: 0, desde: 0 }
  }
}

function guardarIntentos(v: { cantidad: number; desde: number } | null) {
  try {
    if (v) localStorage.setItem(CLAVE_INTENTOS, JSON.stringify(v))
    else localStorage.removeItem(CLAVE_INTENTOS)
  } catch {
    // El bloqueo es solo una ayuda extra: Supabase también limita los intentos.
  }
}

/**
 * `/cuenta?modo=ingresar|registro`: ingresar o crear cuenta con correo y PIN de 6 números. Crear cuenta acepta un código
 * opcional (para regalar acceso), que puede venir en el link: `/cuenta?modo=registro&codigo=ZF-XXXX-XXXX`. Sin código, la
 * cuenta parte con 7 días de prueba.
 */
export default function Cuenta() {
  const cuenta = useCuenta()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const registro = params.get('modo') === 'registro'
  const [codigo, setCodigo] = useState(() => params.get('codigo') ?? '')
  const [conCodigo, setConCodigo] = useState(() => !!params.get('codigo'))
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [verPin, setVerPin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [eligiendo, setEligiendo] = useState(false)
  const volverA = (useLocation().state as { volverA?: string } | null)?.volverA ?? '/entrenar'

  if (cuenta.usuario && !eligiendo) return <Navigate to={volverA} replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setAviso(null)
    const intentos = leerIntentos()
    if (intentos.cantidad >= INTENTOS_MAXIMOS && Date.now() - intentos.desde < BLOQUEO_MS)
      return setError('Demasiados intentos. Espera un minuto y vuelve a intentar.')
    if (registro && codigo.trim() && !esCodigoValido(normalizarCodigo(codigo))) return setError('Revisa el código: no parece válido.')
    if (registro && !nombre.trim()) return setError('Escribe tu nombre.')
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) return setError('Revisa el correo: no parece válido.')
    if (!/^\d{6}$/.test(pin)) return setError('El PIN debe tener exactamente 6 números.')
    if (registro && pin !== pin2) return setError('Los dos PIN no coinciden.')
    setEnviando(true)
    try {
      const resultado = registro
        ? await cuenta.registrar(nombre, correo, pin, codigo.trim() ? normalizarCodigo(codigo) : '')
        : await cuenta.ingresar(correo, pin)
      guardarIntentos(null)
      if (resultado === 'confirmar-correo') setAviso('Te enviamos un correo para confirmar la cuenta. Ábrelo y después ingresa aquí con tu PIN.')
      else if (resultado === 'elegir') setEligiendo(true)
      else navigate(volverA, { replace: true })
    } catch (err) {
      const reiniciar = Date.now() - intentos.desde > BLOQUEO_MS
      const cantidad = (reiniciar ? 0 : intentos.cantidad) + 1
      guardarIntentos({ cantidad, desde: reiniciar ? Date.now() : intentos.desde })
      setError(cantidad >= INTENTOS_MAXIMOS ? 'Demasiados intentos. Espera un minuto y vuelve a intentar.' : (err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  async function elegir(opcion: 'subir' | 'cero') {
    setEnviando(true)
    await cuenta.elegirDatos(opcion)
    navigate(volverA, { replace: true })
  }

  if (eligiendo) {
    return (
      <Pantalla>
        <h1 className="font-marca text-3xl leading-tight font-bold tracking-tight">¡Bienvenido a tu cuenta!</h1>
        <p className="mt-2 text-texto-suave">En este teléfono ya tienes entrenos guardados sin cuenta. ¿Qué hacemos con ellos?</p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={enviando}
            onClick={() => elegir('subir')}
            className="h-13 rounded-2xl bg-lima font-bold text-fondo active:bg-lima-oscuro disabled:opacity-60"
          >
            Guardarlos en mi cuenta
          </button>
          <button
            type="button"
            disabled={enviando}
            onClick={() => elegir('cero')}
            className="h-12 rounded-2xl bg-superficie font-semibold active:bg-borde disabled:opacity-60"
          >
            Empezar de cero
          </button>
        </div>
        <p className="mt-3 text-sm text-texto-suave">
          Si eliges empezar de cero, esos entrenos no se borran del teléfono, pero no quedan en tu cuenta.
        </p>
      </Pantalla>
    )
  }

  return (
    // Crear cuenta tiene más campos: se compacta para que quepa en la pantalla igual que Ingresar.
    <Pantalla compacto={registro}>
      <h1 className="font-marca text-3xl font-bold tracking-tight">{registro ? 'Crea tu cuenta' : 'Ingresa a tu cuenta'}</h1>
      <p className="mt-2 text-texto-suave">
        {registro
          ? 'Pruébala gratis por 7 días. Sin tarjeta ni compromiso.'
          : 'Con tu correo y tu PIN de 6 números entras a tu progreso desde cualquier teléfono.'}
      </p>
      {typeof navigator !== 'undefined' && !navigator.onLine && (
        <p className="mt-3 rounded-xl border border-peligro/50 bg-peligro/10 p-3 text-sm">
          Necesitas conexión a internet para ingresar. Después la app funciona sin señal.
        </p>
      )}

      <div className={`${registro ? 'mt-4' : 'mt-6'} grid grid-cols-2 gap-1 rounded-2xl bg-superficie p-1`} role="tablist">
        {[
          { valor: false, texto: 'Ingresar' },
          { valor: true, texto: 'Crear cuenta' },
        ].map((t) => (
          <button
            key={t.texto}
            type="button"
            role="tab"
            aria-selected={registro === t.valor}
            onClick={() => {
              setParams(t.valor ? { modo: 'registro' } : {}, { replace: true })
              setError(null)
            }}
            className={`h-12 rounded-xl font-semibold ${registro === t.valor ? 'bg-lima text-fondo' : 'text-texto-suave active:bg-borde'}`}
          >
            {t.texto}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} noValidate className={`flex flex-col ${registro ? 'mt-4 gap-3' : 'mt-6 gap-4'}`}>
        {registro && conCodigo && (
          <Campo etiqueta="Código (opcional)">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className={`${claseInput} font-marca font-bold tracking-wider`}
              placeholder="ZF-XXXX-XXXX"
            />
          </Campo>
        )}
        {registro && (
          <Campo etiqueta="Tu nombre">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="given-name"
              autoCapitalize="words"
              className={claseInput}
              placeholder="Ej: Pablo"
            />
          </Campo>
        )}
        <Campo etiqueta="Correo">
          <input
            type="email"
            inputMode="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
            autoCapitalize="none"
            className={claseInput}
            placeholder="tu@correo.cl"
          />
        </Campo>
        {registro ? (
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="PIN (6 números)">
              <InputPin valor={pin} onChange={setPin} ver={verPin} nuevo angosto />
            </Campo>
            <Campo etiqueta="Repite el PIN">
              <InputPin valor={pin2} onChange={setPin2} ver={verPin} nuevo angosto />
            </Campo>
          </div>
        ) : (
          <Campo etiqueta="PIN de 6 números">
            <InputPin valor={pin} onChange={setPin} ver={verPin} nuevo={false} />
          </Campo>
        )}
        {registro && !conCodigo && (
          <button
            type="button"
            onClick={() => setConCodigo(true)}
            className="-mt-1 h-10 self-start text-sm text-texto-suave underline underline-offset-4"
          >
            Tengo un código
          </button>
        )}
        <label className="flex h-12 items-center gap-3 text-texto-suave">
          <input type="checkbox" checked={verPin} onChange={(e) => setVerPin(e.target.checked)} className="size-6 accent-lima" />
          Mostrar PIN
        </label>

        {error && (
          <p className="text-peligro" role="alert">
            {error}
          </p>
        )}
        {aviso && (
          <p className="text-lima" role="status">
            {aviso}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="h-13 rounded-2xl bg-lima font-bold text-fondo active:bg-lima-oscuro disabled:opacity-60"
        >
          {enviando ? 'Un momento…' : registro ? 'Crear cuenta' : 'Ingresar'}
        </button>
      </form>

      {!registro && (
        <p className="mt-6 text-sm text-texto-suave">
          Cada persona que use este teléfono puede tener su propia cuenta: cada una ve solo su progreso.
        </p>
      )}
    </Pantalla>
  )
}

/** Pantalla de acceso a pantalla completa (sin barra inferior), con la marca grande. */
function Pantalla({ children, compacto = false }: { children: ReactNode; compacto?: boolean }) {
  return (
    <main className="pt-safe pb-safe relative mx-auto min-h-dvh max-w-lg px-4">
      <FondoAcceso />
      <PopupInstalar />
      <div className={`text-center ${compacto ? 'pt-6 pb-4' : 'pt-10 pb-8'}`}>
        <Marca className={`${compacto ? 'text-4xl' : 'text-5xl'} drop-shadow-lg`} />
        <FraseMotivadora />
      </div>
      <section className="pb-10">{children}</section>
    </main>
  )
}

const claseInput =
  'h-12 w-full rounded-2xl border border-borde bg-superficie px-4 text-base placeholder:text-texto-suave focus:border-lima focus:outline-none'

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-semibold">{etiqueta}</span>
      {children}
    </label>
  )
}

/** `angosto`: dos PIN lado a lado (al crear la cuenta), con menos espacio entre los dígitos para que quepan. */
function InputPin({
  valor,
  onChange,
  ver,
  nuevo,
  angosto = false,
}: {
  valor: string
  onChange: (v: string) => void
  ver: boolean
  nuevo: boolean
  angosto?: boolean
}) {
  return (
    <input
      type={ver ? 'text' : 'password'}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      autoComplete={nuevo ? 'new-password' : 'current-password'}
      value={valor}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      className={`${claseInput} font-marca font-bold ${angosto ? 'px-3 text-xl tracking-[0.2em]' : 'text-2xl tracking-[0.5em]'}`}
      placeholder="••••••"
    />
  )
}
