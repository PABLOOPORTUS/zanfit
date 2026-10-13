import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
// Escucha desde el principio el aviso de Chrome de que la app se puede instalar (ver lib/instalacion.ts).
import './lib/instalacion'
import './index.css'

// Los datos viven solo en el teléfono: pedir almacenamiento persistente para que el navegador no los borre
// cuando le falte espacio (Chrome lo concede a apps instaladas; Safari lo ignora en silencio).
void navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
