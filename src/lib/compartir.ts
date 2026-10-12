/**
 * Entrega un archivo al usuario: en el teléfono abre la hoja de compartir (Archivos, Drive, WhatsApp, AirDrop…);
 * si no está disponible, lo descarga. Devuelve `false` si el usuario canceló.
 */
export async function compartirArchivo(nombre: string, contenido: string, titulo: string): Promise<boolean> {
  const archivo = new File([contenido], nombre, { type: 'application/json' })
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: titulo })
      return true
    } catch (e) {
      if ((e as Error).name === 'AbortError') return false
    }
  }
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  enlace.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

export function fechaArchivo(fecha = new Date()): string {
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`
}
