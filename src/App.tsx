import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProveedorAjustes from './components/ProveedorAjustes'
import ProveedorCuenta from './components/ProveedorCuenta'
import ConSesion from './components/ConSesion'
import Cuenta from './pages/cuenta/Cuenta'
import ProveedorDescanso from './components/ProveedorDescanso'
import Ajustes from './pages/ajustes/Ajustes'
import Creditos from './pages/ajustes/Creditos'
import Evaluacion from './pages/evaluacion/Evaluacion'
import MiPlan from './pages/evaluacion/MiPlan'
import Entrenar from './pages/entrenar/Entrenar'
import ResumenEntreno from './pages/entrenar/ResumenEntreno'
import ListaRutinas from './pages/rutinas/ListaRutinas'
import DetalleRutina from './pages/rutinas/DetalleRutina'
import NuevaRutina from './pages/rutinas/NuevaRutina'
import EditarRutina from './pages/rutinas/EditarRutina'
import Progreso from './pages/progreso/Progreso'
import DetalleEntreno from './pages/progreso/DetalleEntreno'
import ListaEjercicios from './pages/ejercicios/ListaEjercicios'
import DetalleEjercicio from './pages/ejercicios/DetalleEjercicio'
import NuevoEjercicio from './pages/ejercicios/NuevoEjercicio'
import EditarEjercicio from './pages/ejercicios/EditarEjercicio'

// Recharts pesa ~400 kB: se carga en un chunk aparte solo al abrir un gráfico (igual queda en el precache offline).
const ProgresoEjercicio = lazy(() => import('./pages/progreso/ProgresoEjercicio'))

export default function App() {
  return (
    <ProveedorCuenta>
      <ProveedorAjustes>
        <ProveedorDescanso>
          <Routes>
            <Route path="/cuenta" element={<Cuenta />} />
            <Route
              element={
                <ConSesion>
                  <Layout />
                </ConSesion>
              }
            >
              <Route index element={<Navigate to="/entrenar" replace />} />
              <Route path="/entrenar" element={<Entrenar />} />
              <Route path="/entrenar/resumen/:id" element={<ResumenEntreno />} />
              <Route path="/rutinas" element={<ListaRutinas />} />
              <Route path="/rutinas/nueva" element={<NuevaRutina />} />
              <Route path="/rutinas/:id" element={<DetalleRutina />} />
              <Route path="/rutinas/:id/editar" element={<EditarRutina />} />
              <Route path="/progreso" element={<Progreso />} />
              <Route path="/progreso/entrenos/:id" element={<DetalleEntreno />} />
              <Route
                path="/progreso/ejercicios/:id"
                element={
                  <Suspense fallback={null}>
                    <ProgresoEjercicio />
                  </Suspense>
                }
              />
              <Route path="/ejercicios" element={<ListaEjercicios />} />
              <Route path="/ejercicios/nuevo" element={<NuevoEjercicio />} />
              <Route path="/ejercicios/:id" element={<DetalleEjercicio />} />
              <Route path="/ejercicios/:id/editar" element={<EditarEjercicio />} />
              <Route path="/ajustes" element={<Ajustes />} />
              <Route path="/ajustes/creditos" element={<Creditos />} />
              <Route path="/evaluacion" element={<Evaluacion />} />
              <Route path="/plan" element={<MiPlan />} />
              <Route path="*" element={<Navigate to="/entrenar" replace />} />
            </Route>
          </Routes>
        </ProveedorDescanso>
      </ProveedorAjustes>
    </ProveedorCuenta>
  )
}
