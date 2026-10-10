import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Marca from './Marca'

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="pt-safe sticky top-0 z-10 border-b border-borde bg-fondo/90 backdrop-blur">
        <div className="flex h-14 items-center px-4">
          <Marca />
        </div>
      </header>
      <main className="flex-1 px-4 pt-4 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
