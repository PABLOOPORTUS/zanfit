import FormularioRutina from './FormularioRutina'

/** `/rutinas/nueva`. */
export default function NuevaRutina() {
  return <FormularioRutina inicial={{ nombre: '', ejercicios: [] }} />
}
