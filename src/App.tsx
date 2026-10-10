import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Entrenar from './pages/Entrenar'
import Rutinas from './pages/Rutinas'
import Progreso from './pages/Progreso'
import Ejercicios from './pages/Ejercicios'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/entrenar" replace />} />
        <Route path="/entrenar" element={<Entrenar />} />
        <Route path="/rutinas" element={<Rutinas />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/ejercicios" element={<Ejercicios />} />
        <Route path="*" element={<Navigate to="/entrenar" replace />} />
      </Route>
    </Routes>
  )
}
