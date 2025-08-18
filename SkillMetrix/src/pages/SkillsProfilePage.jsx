import SkillsTable from '../Components/SkillsTable'
import SkillForm from '../Components/SkillForm'
import Modal from '../Components/Modal'
import { useState } from 'react'

export default function SkillsProfilePage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  const handleAddSkill = () => setShowAddForm(true)
  const handleAddClose = () => setShowAddForm(false)
  const handleAddSaved = () => {
    setShowAddForm(false)
    handleRefresh()
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">My Skills</h1>
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            onClick={handleAddSkill}
          >
            + Add Skill
          </button>
        </div>

        <div key={refreshKey}>
          <SkillsTable 
            refreshTrigger={refreshKey} 
            showTopRatedOnly={false} 
            enableSearch={true} 
          />
        </div>
      </div>

      {showAddForm && (
        <Modal isOpen={showAddForm} onClose={handleAddClose} title="Add New Skill">
          <SkillForm onSaved={handleAddSaved} onCancel={handleAddClose} />
        </Modal>
      )}
    </>
  )
}
