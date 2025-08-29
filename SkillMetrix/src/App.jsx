import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './Layout/MainLayout'
import DashboardPage from "./Pages/DashboardPage";
import SkillsProfilePage from './Pages/SkillsProfilePage'
import MyExperiencePage from './Pages/MyExperiencePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}> 
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/skills-profile" element={<SkillsProfilePage />} />
          <Route path="/experience" element={<MyExperiencePage/>}/>

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
