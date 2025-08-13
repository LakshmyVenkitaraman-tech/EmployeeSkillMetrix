import { Outlet, NavLink } from 'react-router-dom'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="flex h-screen">
        <aside className="w-64 border-r bg-white">
          <Sidebar />
        </aside>
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="p-6 overflow-auto flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

