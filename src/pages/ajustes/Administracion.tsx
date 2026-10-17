import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import CompartirApp from '../../components/CompartirApp'
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
  espacioUsado,
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
  const acceso = useAcceso()
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
  const voluntario = acceso?.voluntario === true
  const porConfirmar = lista.filter((c) => esperaPago(c, Date.now(), voluntario))
  const enPruebaLista = lista.filter((c) => c.estado !== 'activa' && c.estado !== 'bloqueada' && !esperaPago(c, Date.now(), voluntario))
  const activasLista = lista.filter((c) => c.estado === 'activa' && !esperaPago(c, Date.now(), voluntario))
  const pausadas = lista.filter((c) => c.estado === 'bloqueada')
  const enPrueba = enPruebaLista.length
  const activas = activasLista.length

  return (
    <section className="pb-10">
      <BotonVolver to="/ajustes">Ajustes</BotonVolver>
      <h1 className="mt-2 font-marca text-3xl font-semibold tracking-tight">Administración</h1>
      <p className="mt-1 text-texto-suave">
        {voluntario
          ? `${activas + enPrueba} ${activas + enPrueba === 1 ? 'cuenta' : 'cuentas'} · gratis con aporte voluntario`
          : `${activas} ${activas === 1 ? 'cuenta activa' : 'cuentas activas'} · ${enPrueba} en prueba · ${porConfirmar.length} por activar`}
      </p>
      <MedidorEspacio />
      {error && (
        <p className="mt-3 rounded-xl border border-peligro/50 bg-peligro/10 p-3 text-sm" role="alert">
          {error}
        </p>
      )}

      {!voluntario && (
        <>
          <Titulo>
            Pendientes de activación
            {porConfirmar.length > 0 && <span className="ml-2 rounded-full bg-lima px-2 py-0.5 text-fondo">{porConfirmar.length}</span>}
          </Titulo>
          <p className="mb-3 text-sm text-texto-suave">
            Terminaron su prueba o su período. Cuando confirmes el pago, actívalos por el período que pagaron.
          </p>
          <ListaCuentas cuentas={cuentas && porConfirmar} vacio="No hay nadie esperando activación." onAccion={accion} />
        </>
      )}

      <Titulo>{voluntario ? 'Usando gratis' : 'En prueba'}</Titulo>
      <ListaCuentas cuentas={cuentas && enPruebaLista} vacio="Nadie está probando la app ahora." onAccion={accion} />

      <Titulo>{voluntario ? 'Con período pagado' : 'Activas'}</Titulo>
      <ListaCuentas cuentas={cuentas && activasLista} vacio="Todavía no hay cuentas activas." onAccion={accion} />

      {pausadas.length > 0 && (
        <>
          <Titulo>Pausadas</Titulo>
          <ListaCuentas cuentas={pausadas} vacio="" onAccion={accion} />
        </>
      )}

      <Titulo>Compartir ZANFIT</Titulo>
      <CompartirApp />

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
            <li key={c.codigo} className="rounded-2xl bg-superficie p-4">
              <p className="font-marca text-xl font-semibold tracking-wider select-all">{c.codigo}</p>
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
      <p className="font-marca text-xl font-semibold">Nuevo código</p>
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
          className="h-12 rounded-2xl border border-borde bg-fondo px-4 text-base placeholder:text-texto-suave focus:border-lima focus:outline-none"
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
        className="mt-4 h-12 w-full rounded-2xl bg-lima font-semibold text-fondo active:bg-lima-oscuro disabled:opacity-60"
      >
        {creando ? 'Creando…' : 'Generar código'}
      </button>
      {creado && (
        <div className="mt-4 animate-aparecer rounded-2xl border border-lima bg-lima/10 p-4 text-center">
          <p className="text-sm text-texto-suave">{creado.tipo === 'prueba' ? `Código de prueba (${creado.dias} días)` : 'Código de compra'}</p>
          <p className="mt-1 font-marca text-3xl font-semibold tracking-wider text-lima select-all">{creado.codigo}</p>
          <button
            type="button"
            onClick={() => void compartirCodigo(creado)}
            className="mt-3 h-12 w-full rounded-xl bg-lima font-semibold text-fondo active:bg-lima-oscuro"
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
  const claseCampo = 'rounded-2xl border border-borde bg-fondo px-4 text-base placeholder:text-texto-suave focus:border-lima focus:outline-none'

  return (
    <>
      <Titulo>Datos de venta y aportes</Titulo>
      <p className="mb-3 text-sm text-texto-suave">
        {datos.aporte_voluntario
          ? 'Se muestran en «Apoyar ZANFIT» (Entrenar y Ajustes), para quien quiera aportar.'
          : 'Se muestran a quien tiene la prueba vencida o la cuenta sin activar.'}
      </p>
      <div className="flex flex-col gap-3 rounded-2xl bg-superficie p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={!!datos.aporte_voluntario}
            onChange={(e) => cambiar({ aporte_voluntario: e.target.checked })}
            className="mt-0.5 size-6 shrink-0 accent-lima"
          />
          <span>
            <span className="block font-semibold">Aporte voluntario</span>
            <span className="block text-sm text-texto-suave">
              La app es gratis para todos y nadie se bloquea por fecha (solo las cuentas pausadas). Si lo apagas, vuelve el cobro con prueba.
            </span>
          </span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">{datos.aporte_voluntario ? 'Aporte sugerido (opcional)' : 'Precio'}</span>
          <input
            value={datos.precio}
            onChange={(e) => cambiar({ precio: e.target.value })}
            placeholder="Ej: $14.990"
            className={`h-12 ${claseCampo}`}
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
            className={`h-12 ${claseCampo}`}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Días de prueba</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            value={datos.dias_prueba}
            onChange={(e) => cambiar({ dias_prueba: Math.min(365, Math.max(1, Number(e.target.value) || 7)) })}
            className={`h-12 ${claseCampo}`}
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
          className="h-12 rounded-2xl bg-lima font-semibold text-fondo active:bg-lima-oscuro"
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
  const espera = esperaPago(c, Date.now(), useAcceso()?.voluntario === true)
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
      {!!c.cambios_dispositivo && (
        <p className={`mt-1 text-xs ${c.cambios_dispositivo >= 5 ? 'font-semibold text-peligro' : 'text-texto-suave'}`}>
          Cambió de teléfono {c.cambios_dispositivo} {c.cambios_dispositivo === 1 ? 'vez' : 'veces'}
          {c.cambios_dispositivo >= 5 && ': puede que la estén compartiendo'}
        </p>
      )}
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
  return <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${clase}`}>{texto}</span>
}

function Titulo({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">{children}</h2>
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

/** Límite del plan gratuito de Supabase (base de datos). Sobre el 70% conviene dejar de vender hasta pasar a pagado. */
const LIMITE_MB = 500
const AVISO = 0.7

function MedidorEspacio() {
  const [bytes, setBytes] = useState<number | null>(null)
  useEffect(() => {
    void espacioUsado().then(setBytes)
  }, [])
  if (bytes === null) return null
  const mb = bytes / 1024 / 1024
  const uso = mb / LIMITE_MB
  const alto = uso >= AVISO
  return (
    <div className={`mt-4 rounded-2xl border p-4 ${alto ? 'border-peligro/60 bg-peligro/10' : 'border-borde bg-superficie'}`}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">Espacio usado</span>
        <span className="tabular-nums">
          {mb < 10 ? mb.toFixed(1).replace('.', ',') : Math.round(mb)} MB de {LIMITE_MB} MB ({Math.round(uso * 100)}%)
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-borde">
        <div className={`h-full rounded-full ${alto ? 'bg-peligro' : 'bg-lima'}`} style={{ width: `${Math.min(100, Math.max(uso * 100, 1))}%` }} />
      </div>
      <p className="mt-2 text-xs text-texto-suave">
        {alto
          ? 'Pasaste el 70%: deja de sumar usuarios nuevos hasta pasar Supabase a un plan pagado.'
          : 'Plan gratuito de Supabase. Sobre el 70%, deja de vender hasta pasar a un plan pagado.'}
      </p>
    </div>
  )
}
