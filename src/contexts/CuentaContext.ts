import { createContext } from 'react'

export interface Usuario {
  id: string
  correo: string
  nombre: string
}

export type EstadoSync = 'sincronizado' | 'sincronizando' | 'pendiente' | 'sin-conexion' | 'error'

export interface CuentaApi {
  usuario: Usuario | null
  estado: EstadoSync
  mensajeError: string | null
  ultimaSync: number | null
  /** 'elegir': el usuario tiene datos sin cuenta en el teléfono y la nube está vacía: hay que preguntarle qué hacer. */
  ingresar: (correo: string, pin: string) => Promise<'listo' | 'elegir'>
  /** Crea la cuenta con un código de acceso (de prueba o de compra) en `api/registro` e ingresa. */
  registrar: (nombre: string, correo: string, pin: string, codigo: string) => Promise<'listo' | 'elegir' | 'confirmar-correo'>
  /** Respuesta a la pregunta del primer ingreso. */
  elegirDatos: (opcion: 'subir' | 'cero') => Promise<void>
  cerrarSesion: () => Promise<void>
  sincronizarAhora: () => Promise<void>
}

export const CuentaContext = createContext<CuentaApi | null>(null)
