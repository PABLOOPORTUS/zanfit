import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import SelectorOpciones from '../../components/SelectorOpciones'
import { useAcceso } from '../../hooks/useAcceso'
import {
  actualizarCuenta,
  borrarCodigo,
  crearCodigo,
  datosVenta,
  diasRestantes,
  guardarDatosVenta,
  listarCodigos,
  listarCuentas,
  activarPor,
  esperaPago,
  PERIODOS,
  type Codigo,
  type Cuenta,
  type DatosVenta,
} from '../../lib/acceso'
import { formatearFecha } from '../../lib/formato'

const DIA = 86_400_000
const linkRegistro = (codigo: string) => `${location.origin}/cuenta?modo=registro&codigo=${codigo}`

/** Comparte el código con la hoja de compartir del teléfono (WhatsApp…) o lo copia si no se puede. */
async function compartirCodigo(c: Pick<Codigo, 'codigo' | 'tipo' | 'dias'>) {
  const texto =
    c.tipo === 'prueba'
      ? `¡Hola! Aquí tienes tu prueba gratis de ZANFIT por ${c.dias} días. Crea tu cuenta con este código: ${c.codigo}\n${linkRegistro(c.codigo)}`
      : `¡Gracias por tu compra! Crea tu cuenta de ZANFIT con este código: ${c.codigo}\n${linkRegistro(c.codigo)}`
  if (navigator.share) {
    try {
      await navigator.share({ text: texto })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  await navigator.clipboard?.writeText(texto)
}

/** `/admin`: solo para administradores (tabla `admins` en Supabase; las reglas de la nube también lo exigen). */
export default function Administracion() {
  const acceso = useAcceso()
  if (acceso && !acceso.admin) return <Navigate to="/ajustes" replace />
  if (!acceso) return null
  return <Panel />
}

function Panel() {
  const [cuentas, setCuentas] = useState<Cuenta[] | null>(null)
  const [codigos, setCodigos] = useState<Codigo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const cargar = useCallback(async () => {
    try {
      setError(null)
      const [c, k] = await Promise.all([listarCuentas(), listarCodigos()])
      setCuentas(c)
      setCodigos(k)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])
  useEffect(() => {
    void cargar()
  }, [cargar])

  const accion = (fn: () => Promise<void>) => async () => {
    try {
      await fn()
      await cargar()
    } catch (e) {
      setError((e as Error).message)
    }
  }
  const pendientes = codigos?.filter((c) => !c.usado_por) ?? []
  const lista = cuentas ?? []
  const porConfirmar = lista.filter((c) => esperaPago(c))
  const enPruebaLista = lista.filter((c) => c.estado === 'prueba' && !esperaPago(c))
  const activasLista = lista.filter((c) => c.estado === 'activa' && !esperaPago(c))
  const pausadas = lista.filter((c) => c.estado === 'bloqueada')
  const enPrueba = enPruebaLista.length
  const activas = activasLista.length

  return (
    <section className="pb-10">
      <BotonVolver to="/ajustes">Ajustes</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl font-bold tracking-tight">Administración</h1>
      <p className="mt-1 text-texto-suave">
        {activas} {activas === 1 ? 'cuenta activa' : 'cuentas activas'} · {enPrueba} en prueba · {porConfirmar.length} por activar
      </p>
      {error && (
        <p className="mt-3 rounded-xl border border-peligro/50 bg-peligro/10 p-3 text-sm" role="alert">
          {error}
        </p>
      )}

      <Titulo>
        Pendientes de activación
        {porConfirmar.length > 0 && <span className="ml-2 rounded-full bg-lima px-2 py-0.5 text-fondo">{porConfirmar.length}</span>}
      </Titulo>
      <p className="mb-3 text-sm text-texto-suave">
        Terminaron su prueba o su período. Cuando confirmes el pago, actívalos por el período que pagaron.
      </p>
      <ListaCuentas cuentas={cuentas && porConfirmar} vacio="No hay nadie esperando activación." onAccion={accion} />

      <Titulo>En prueba</Titulo>
      <ListaCuentas cuentas={cuentas && enPruebaLista} vacio="Nadie está probando la app ahora." onAccion={accion} />

      <Titulo>Activas</Titulo>
      <ListaCuentas cuentas={cuentas && activasLista} vacio="Todavía no hay cuentas activas." onAccion={accion} />

      {pausadas.length > 0 && (
        <>
          <Titulo>Pausadas</Titulo>
          <ListaCuentas cuentas={pausadas} vacio="" onAccion={accion} />
        </>
      )}

      <Titulo>Regalar acceso</Titulo>
      <p className="mb-3 text-sm text-texto-suave">
        Opcional: un código para crear una cuenta ya activa (compra) o con prueba, por ejemplo para regalar.
      </p>
      <NuevoCodigo onCreado={cargar} />

      <Titulo>Códigos sin usar</Titulo>
      {pendientes.length === 0 ? (
        <p className="text-texto-suave">No hay códigos pendientes.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pendientes.map((c) => (
            <li key={c.codigo} className="rounded-2xl border border-borde bg-superficie p-4">
              <p className="font-marca text-xl font-bold tracking-wider select-all">{c.codigo}</p>
              <p className="text-sm text-texto-suave">
                {c.tipo === 'prueba' ? `Prueba de ${c.dias} días` : 'Compra'} · {formatearFecha(new Date(c.creado_en).getTime())}
                {c.nota ? ` · ${c.nota}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Boton principal onClick={() => void compartirCodigo(c)}>
                  Compartir
                </Boton>
                <Boton onClick={accion(() => borrarCodigo(c.codigo))}>Borrar</Boton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DatosDeVenta />
    </section>
  )
}

function NuevoCodigo({ onCreado }: { onCreado: () => Promise<void> }) {
  const [tipo, setTipo] = useState<Codigo['tipo']>('prueba')
  const [nota, setNota] = useState('')
  const [dias, setDias] = useState(7)
  const [creado, setCreado] = useState<Pick<Codigo, 'codigo' | 'tipo' | 'dias'> | null>(null)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    void datosVenta().then((v) => v?.dias_prueba && setDias(v.dias_prueba))
  }, [])

  return (
    <div className="mt-6 rounded-2xl border border-lima/50 bg-superficie p-4">
      <p className="font-marca text-xl font-bold">Nuevo código</p>
      <div className="mt-3">
        <SelectorOpciones
          leyenda="Tipo"
          opciones={[
            { valor: 'prueba', etiqueta: `Prueba (${dias} días)` },
            { valor: 'compra', etiqueta: 'Compra' },
          ]}
          valor={tipo}
          onChange={(v) => setTipo(v as Codigo['tipo'])}
          columnas={2}
        />
      </div>
      <label className="mt-3 flex flex-col gap-2">
        <span className="font-semibold">Nota (opcional)</span>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ej: Juan Pérez, transferencia 12/10"
          className="h-14 rounded-2xl border border-borde bg-fondo px-4 text-lg placeholder:text-texto-suave focus:border-lima focus:outline-none"
        />
      </label>
      {error && <p className="mt-2 text-sm text-peligro">{error}</p>}
      <button
        type="button"
        disabled={creando}
        onClick={async () => {
          setCreando(true)
          setError(null)
          try {
            const codigo = await crearCodigo(tipo, dias, nota.trim())
            setCreado({ codigo, tipo, dias })
            setNota('')
            await onCreado()
          } catch (e) {
            setError((e as Error).message)
          } finally {
            setCreando(false)
          }
        }}
        className="mt-4 h-14 w-full rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro disabled:opacity-60"
      >
        {creando ? 'Creando…' : 'Generar código'}
      </button>
      {creado && (
        <div className="mt-4 animate-aparecer rounded-2xl border border-lima bg-lima/10 p-4 text-center">
          <p className="text-sm text-texto-suave">{creado.tipo === 'prueba' ? `Código de prueba (${creado.dias} días)` : 'Código de compra'}</p>
          <p className="mt-1 font-marca text-3xl font-bold tracking-wider text-lima select-all">{creado.codigo}</p>
          <button
            type="button"
            onClick={() => void compartirCodigo(creado)}
            className="mt-3 h-12 w-full rounded-xl bg-lima font-bold text-fondo active:bg-lima-oscuro"
          >
            Enviar por WhatsApp u otra app
          </button>
        </div>
      )}
    </div>
  )
}

function DatosDeVenta() {
  const [datos, setDatos] = useState<DatosVenta | null>(null)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    void datosVenta().then((d) => setDatos(d ?? { precio: '', datos_transferencia: '', contacto: '', dias_prueba: 7 }))
  }, [])
  if (!datos) return null
  const cambiar = (c: Partial<DatosVenta>) => {
    setDatos({ ...datos, ...c })
    setGuardado(false)
  }
  const claseCampo = 'rounded-2xl border border-borde bg-fondo px-4 text-lg placeholder:text-texto-suave focus:border-lima focus:outline-none'

  return (
    <>
      <Titulo>Datos de venta</Titulo>
      <p className="mb-3 text-sm text-texto-suave">Se muestran a quien tiene la prueba vencida o la cuenta sin activar.</p>
      <div className="flex flex-col gap-3 rounded-2xl border border-borde bg-superficie p-4">
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Precio</span>
          <input
            value={datos.precio}
            onChange={(e) => cambiar({ precio: e.target.value })}
            placeholder="Ej: $14.990"
            className={`h-14 ${claseCampo}`}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Datos para transferir</span>
          <textarea
            value={datos.datos_transferencia}
            onChange={(e) => cambiar({ datos_transferencia: e.target.value })}
            rows={6}
            placeholder={'Nombre\nRUT\nBanco\nTipo y número de cuenta\nCorreo'}
            className={`py-3 ${claseCampo}`}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Contacto para el comprobante</span>
          <input
            value={datos.contacto}
            onChange={(e) => cambiar({ contacto: e.target.value })}
            placeholder="Ej: +56 9 1234 5678"
            className={`h-14 ${claseCampo}`}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Días de prueba</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            value={datos.dias_prueba}
            onChange={(e) => cambiar({ dias_prueba: Math.min(60, Math.max(1, Number(e.target.value) || 7)) })}
            className={`h-14 ${claseCampo}`}
          />
        </label>
        {error && <p className="text-sm text-peligro">{error}</p>}
        <button
          type="button"
          onClick={async () => {
            try {
              setError(null)
              await guardarDatosVenta(datos)
              setGuardado(true)
            } catch (e) {
              setError((e as Error).message)
            }
          }}
          className="h-14 rounded-2xl bg-lima text-lg font-bold text-fondo active:bg-lima-oscuro"
        >
          {guardado ? 'Guardado ✓' : 'Guardar'}
        </button>
      </div>
    </>
  )
}

type Accion = (fn: () => Promise<void>) => () => Promise<void>

function ListaCuentas({ cuentas, vacio, onAccion }: { cuentas: Cuenta[] | null; vacio: string; onAccion: Accion }) {
  if (cuentas === null) return <p className="text-texto-suave">Cargando…</p>
  if (cuentas.length === 0) return <p className="text-texto-suave">{vacio}</p>
  return (
    <ul className="flex flex-col gap-2">
      {cuentas.map((c) => (
        <FilaCuenta key={c.user_id} cuenta={c} onAccion={onAccion} />
      ))}
    </ul>
  )
}

/** Una cuenta con su estado y acciones: activar por un período (al confirmar el pago), extender la prueba o pausar. */
function FilaCuenta({ cuenta: c, onAccion }: { cuenta: Cuenta; onAccion: Accion }) {
  const [eligiendo, setEligiendo] = useState(false)
  const espera = esperaPago(c)
  return (
    <li className={`rounded-2xl border bg-superficie p-4 ${espera ? 'border-lima/60' : 'border-borde'}`}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{c.nombre || 'Sin nombre'}</p>
          <p className="truncate text-sm text-texto-suave select-all">{c.correo}</p>
        </div>
        <Estado cuenta={c} />
      </div>
      <p className="mt-1 text-xs text-texto-suave">
        Se registró el {formatearFecha(new Date(c.creada_en).getTime())}
        {c.codigo ? ` · ${c.codigo}` : ''}
      </p>
      {eligiendo ? (
        <div className="mt-3">
          <p className="mb-2 text-sm font-semibold">¿Por cuánto tiempo pagó?</p>
          <div className="grid grid-cols-2 gap-2">
            {PERIODOS.map((p) => (
              <Boton key={p.etiqueta} principal onClick={onAccion(() => activarPor(c, p.dias))}>
                {p.etiqueta}
              </Boton>
            ))}
            <Boton onClick={() => setEligiendo(false)}>Cancelar</Boton>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Boton principal onClick={() => setEligiendo(true)}>
            {c.estado === 'activa' && !espera ? 'Renovar…' : 'Activar…'}
          </Boton>
          {c.estado === 'prueba' && (
            <Boton
              onClick={onAccion(() =>
                actualizarCuenta(c.user_id, {
                  prueba_hasta: new Date(Math.max(Date.now(), new Date(c.prueba_hasta ?? 0).getTime()) + 7 * DIA).toISOString(),
                }),
              )}
            >
              +7 días de prueba
            </Boton>
          )}
          {c.estado !== 'bloqueada' && <Boton onClick={onAccion(() => actualizarCuenta(c.user_id, { estado: 'bloqueada' }))}>Pausar</Boton>}
        </div>
      )}
    </li>
  )
}

function Estado({ cuenta: c }: { cuenta: Cuenta }) {
  const quedan = (hasta: string | null) => diasRestantes(hasta ? new Date(hasta).getTime() : null)
  const dias = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`
  const [texto, clase] =
    c.estado === 'bloqueada'
      ? ['Pausada', 'border-borde text-texto-suave']
      : c.estado === 'pendiente'
        ? ['Por activar', 'border-peligro/60 text-peligro']
        : c.estado === 'prueba'
          ? quedan(c.prueba_hasta) === 0
            ? ['Prueba vencida', 'border-peligro/60 text-peligro']
            : [`Prueba · ${dias(quedan(c.prueba_hasta))}`, 'border-lima/60 text-lima']
          : !c.activa_hasta
            ? ['Activa', 'border-lima bg-lima text-fondo']
            : quedan(c.activa_hasta) === 0
              ? ['Venció', 'border-peligro/60 text-peligro']
              : [`Activa hasta ${formatearFecha(new Date(c.activa_hasta).getTime())}`, 'border-lima bg-lima text-fondo']
  return <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${clase}`}>{texto}</span>
}

function Titulo({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 mb-2 text-sm font-bold tracking-wide text-texto-suave uppercase">{children}</h2>
}

function Boton({ children, onClick, principal = false }: { children: ReactNode; onClick: () => void; principal?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl px-4 text-sm font-semibold ${principal ? 'bg-lima text-fondo active:bg-lima-oscuro' : 'border border-borde active:bg-borde'}`}
    >
      {children}
    </button>
  )
}
