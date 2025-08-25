import { useState } from 'react'
import { api } from '../API/userApi'
import { getResolvedUserId } from '../Utils/envConfig'
import ReusableTable from '../Components/ReusableTable'
import ExperienceForm from '../Components/ExperienceForm'
import Modal from '../Components/Modal'

export default function MyExperiencePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const userId = getResolvedUserId()

  const experienceColumns = [
    "Company",
    "Designation", 
    "Years of Experience",
    "Start Date",
    "End Date"
  ]

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  const renderExperienceCell = (exp) => {
    const companyName = exp.company_name || exp.company || ''
    const designation = exp.designation || exp.job_title || ''
    const yearsExp = exp.years_of_experience || exp.years_experience || 0
    const startDate = formatDate(exp.start_date)
    const endDate = exp.end_date ? formatDate(exp.end_date) : 'Current'

    return (
      <>
        <td className="py-2 px-4 font-medium">{companyName}</td>
        <td className="py-2 px-4">{designation}</td>
        <td className="py-2 px-4">{yearsExp}</td>
        <td className="py-2 px-4">{startDate}</td>
        <td className="py-2 px-4">{endDate}</td>
      </>
    )
  }

  const getExperienceId = (exp) => exp.id
  const getExperienceName = (exp) => exp.company_name || exp.company || 'Experience'

  const handleAddExperience = () => {
    setSelectedItem(null)
    setShowAddForm(true)
  }

  const handleEditItem = (item) => {
    setSelectedItem(item)
    setShowAddForm(true)
  }

  const handleFormClose = () => {
    setShowAddForm(false)
    setSelectedItem(null)
  }

  const handleFormSaved = () => {
    handleFormClose()
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Work Experience</h1>
        <button 
          onClick={handleAddExperience}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          + Add Experience
        </button>
      </div>

      <ReusableTable
        refreshTrigger={refreshTrigger}
        apiFunction={api.getUserEmploymentHistory}
        userId={userId}
        columns={experienceColumns}
        renderCell={renderExperienceCell}
        FormComponent={ExperienceForm}
        editTitle="Edit Experience"
        deleteTitle="Delete Experience"
        emptyMessage="No work experience found"
        loadingMessage="Loading work experience..."
        updateFunction={api.updateEmploymentHistory}
        deleteFunction={api.deleteEmploymentHistory}
        getItemId={getExperienceId}
        getItemName={getExperienceName}
        showActions={true}
        showViewButton={true}
        onEditClick={handleEditItem}
      />

      {showAddForm && (
        <Modal 
          isOpen={showAddForm} 
          onClose={handleFormClose} 
          title={selectedItem ? "Edit Experience" : "Add Experience"} 
          size="lg"
        >
          <ExperienceForm 
            selectedExperience={selectedItem}
            onSaved={handleFormSaved} 
            onCancel={handleFormClose}
          />
        </Modal>
      )}
    </div>
  )
}