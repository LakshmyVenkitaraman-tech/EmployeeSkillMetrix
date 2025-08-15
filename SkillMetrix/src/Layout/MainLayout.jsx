import { Outlet, NavLink } from 'react-router-dom'
import Sidebar from '../Components/Sidebar'
import Header from '../Components/Header'

export default function MainLayout() {
  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden fixed top-0 left-0">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r border-gray-200 flex-shrink-0 h-full ">
        <Sidebar />
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}