import { useState } from 'react'
import SkillsTable from './SkillsTable'
import SkillForm from './SkillForm'

export default function SkillsProfile() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">My Skills</h1>
  <button className="bg-orange-500 text-white px-4 py-2 rounded  " onClick={() => setShowForm(true)}> + Add Skill</button>
      </div>
  <div key={refreshKey}>
<SkillsTable refreshTrigger={refreshKey} showTopRatedOnly={false} enableSearch={true} />  </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
       <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Skill</h2>
        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-xl"> x </button>
            </div>
<SkillForm onSaved={() => { setShowForm(false); handleRefresh();
              }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
