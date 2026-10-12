let contexto: AudioContext | null = null

/**
 * iOS y Chrome solo permiten audio si el AudioContext se creó o reanudó durante un toque del usuario.
 * Llamar esto al marcar una serie deja el audio listo para cuando termine el descanso.
 */
export function prepararAudio(): void {
  try {
    contexto ??= new AudioContext()
    if (contexto.state === 'suspended') void contexto.resume()
  } catch {
    contexto = null
  }
}

/** Tres pitidos cortos, generados (sin archivos de audio, funciona offline). */
export function sonarFinDescanso(): void {
  if (!contexto) return
  const inicio = contexto.currentTime + 0.05
  for (let i = 0; i < 3; i++) {
    const t = inicio + i * 0.25
    const osc = contexto.createOscillator()
    const vol = contexto.createGain()
    osc.type = 'square'
    osc.frequency.value = i === 2 ? 1320 : 880
    vol.gain.setValueAtTime(0, t)
    vol.gain.linearRampToValueAtTime(0.25, t + 0.01)
    vol.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    osc.connect(vol).connect(contexto.destination)
    osc.start(t)
    osc.stop(t + 0.2)
  }
}

/** No existe en iOS Safari; ahí solo suena. */
export function vibrar(): void {
  navigator.vibrate?.([400, 150, 400])
}
