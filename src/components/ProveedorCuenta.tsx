import type { User } from '@supabase/supabase-js'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CuentaContext, type CuentaApi, type EstadoSync, type Usuario } from '../contexts/CuentaContext'
import { BASE_INVITADO, db, nombreBase, ultimoCambio, usarBase } from '../db'
import { copiarInvitadoAUsuario, ErrorNube, hayDatosDeInvitado, hayDatosEnLaNube, sincronizar, subir } from '../db/nube'
import { cliente, haySesionGuardada, mensajeErrorNube } from '../lib/clienteNube'

const ESPERA_SUBIDA_MS = 4000

function aUsuario(u: User): Usuario {
  return { id: u.id, correo: u.email ?? '', nombre: (u.user_metadata?.nombre as string | undefined)?.trim() || (u.email ?? '').split('@')[0] }
}

/**
 * Cuenta opcional con Supabase. Sin sesión se usa la base `zanfit` (como siempre); con sesión, la base del usuario.
 * Al cambiar de base, toda la app se vuelve a montar (`key`), así ningún componente queda leyendo la base anterior.
 */
export default function ProveedorCuenta({ children }: { children: ReactNode }) {
  const [listo, setListo] = useState(false)
  const [base, setBase] = useState(BASE_INVITADO)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [estado, setEstado] = useState<EstadoSync>('sincronizado')
  const [error, setError] = useState<string | null>(null)
  const [ultimaSync, setUltimaSync] = useState<number | null>(null)
  const pendiente = useRef<User | null>(null)
  const corriendo = useRef(false)

  const activar = useCallback((u: User) => {
    usarBase(nombreBase(u.id))
    setUsuario(aUsuario(u))
    setBase(nombreBase(u.id))
  }, [])

  const correr = useCallback(async (uid: string) => {
    if (corriendo.current) return
    if (!navigator.onLine) return setEstado('sin-conexion')
    corriendo.current = true
    setEstado('sincronizando')
    try {
      await sincronizar(uid)
      setEstado(ultimoCambio(db.name) ? 'pendiente' : 'sincronizado')
      setError(null)
      setUltimaSync(Date.now())
    } catch (e) {
      if (e instanceof ErrorNube) {
        setEstado('error')
        setError(e.message)
      } else setEstado('sin-conexion')
    } finally {
      corriendo.current = false
    }
  }, [])

  // Sesión guardada al abrir la app.
  useEffect(() => {
    // Sin sesión guardada no se carga Supabase: la app abre directo con la base sin cuenta.
    if (!haySesionGuardada()) {
      setListo(true)
      return
    }
    let cancelar = () => {}
    cliente().then(async (sb) => {
      const { data } = await sb.auth.getSession()
      if (data.session) activar(data.session.user)
      setListo(true)
      const { data: suscripcion } = sb.auth.onAuthStateChange((evento) => {
        if (evento === 'SIGNED_OUT') {
          usarBase(BASE_INVITADO)
          setUsuario(null)
          setBase(BASE_INVITADO)
        }
      })
      cancelar = () => suscripcion.subscription.unsubscribe()
    }, () => setListo(true))
    return () => cancelar()
  }, [activar])

  // Sincronización automática mientras hay sesión.
  useEffect(() => {
    if (!usuario) return
    let espera: ReturnType<typeof setTimeout> | undefined
    const alCambiar = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== db.name) return
      setEstado('pendiente')
      clearTimeout(espera)
      espera = setTimeout(() => correr(usuario.id), ESPERA_SUBIDA_MS)
    }
    const alConectar = () => correr(usuario.id)
    const alOcultar = () => {
      if (document.visibilityState === 'hidden' && ultimoCambio(db.name)) correr(usuario.id)
    }
    window.addEventListener('zanfit:cambio', alCambiar)
    window.addEventListener('online', alConectar)
    document.addEventListener('visibilitychange', alOcultar)
    correr(usuario.id)
    return () => {
      clearTimeout(espera)
      window.removeEventListener('zanfit:cambio', alCambiar)
      window.removeEventListener('online', alConectar)
      document.removeEventListener('visibilitychange', alOcultar)
    }
  }, [usuario, correr])

  /** Después de autenticar: si la nube está vacía y hay datos sin cuenta en el teléfono, hay que preguntar. */
  const trasAutenticar = useCallback(
    async (u: User): Promise<'listo' | 'elegir'> => {
      const enNube = await hayDatosEnLaNube(u.id).catch(() => true)
      if (!enNube && (await hayDatosDeInvitado())) {
        pendiente.current = u
        return 'elegir'
      }
      activar(u)
      return 'listo'
    },
    [activar],
  )

  const api = useMemo<CuentaApi>(
    () => ({
      usuario,
      estado,
      mensajeError: error,
      ultimaSync,
      ingresar: async (correo, pin) => {
        const { data, error } = await (await cliente()).auth.signInWithPassword({ email: correo.trim(), password: pin })
        if (error || !data.user) throw new Error(await mensajeErrorNube(error))
        return trasAutenticar(data.user)
      },
      registrar: async (nombre, correo, pin) => {
        const { data, error } = await (await cliente()).auth.signUp({ email: correo.trim(), password: pin, options: { data: { nombre: nombre.trim() } } })
        if (error || !data.user) throw new Error(await mensajeErrorNube(error))
        // Si el proyecto exige confirmar el correo, no hay sesión hasta que la persona confirme.
        if (!data.session) return 'confirmar-correo'
        return trasAutenticar(data.user)
      },
      elegirDatos: async (opcion) => {
        const u = pendiente.current
        if (!u) return
        if (opcion === 'subir') await copiarInvitadoAUsuario(u.id)
        pendiente.current = null
        activar(u)
      },
      cerrarSesion: async () => {
        // Antes de salir, subir lo que falte (si no hay conexión, queda guardado en el teléfono y se sube al volver).
        if (usuario && ultimoCambio(db.name)) await subir(usuario.id).catch(() => undefined)
        await (await cliente()).auth.signOut()
        usarBase(BASE_INVITADO)
        setUsuario(null)
        setBase(BASE_INVITADO)
      },
      sincronizarAhora: async () => {
        if (usuario) await correr(usuario.id)
      },
    }),
    [usuario, estado, error, ultimaSync, trasAutenticar, activar, correr],
  )

  if (!listo) return null
  return (
    <CuentaContext.Provider value={api}>
      <Fragment key={base}>
        {children}
      </Fragment>
    </CuentaContext.Provider>
  )
}
