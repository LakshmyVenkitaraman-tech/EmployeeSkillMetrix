import { getResolvedUserId } from '../Utils/envConfig'
import ReusableTable from '../Components/ReusableTable'
import { api, calculateSkillLevel } from '../API/userApi'
import SkillForm from '../Components/SkillForm'
import { useState } from 'react'

export default function SkillsTable({ refreshTrigger, showTopRatedOnly = false }) {
  const userId = getResolvedUserId()
  const [selectedItem, setSelectedItem] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)

  const formatExperience = (yearsExperience) => {
    const totalMonths = Math.round(yearsExperience * 12)
    if (totalMonths < 12) {
      return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'}`
    }
    const years = Math.floor(totalMonths / 12)
    const remainingMonths = totalMonths % 12
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`
    }
    return `${years}.${remainingMonths} years`
  }

  const skillsColumns = ["Skill", "Rating", "Experience", "Skill Level"]

  const renderSkillCell = (skill) => {
    const skillName = skill.skill_name
    const rating = skill.proficiency ? Number(skill.proficiency) : 0
    const experienceText = formatExperience(skill.years_experience || 0)
    const level = calculateSkillLevel(rating)

    return (
      <>
        <td className="py-2 px-4 font-medium">{skillName}</td>
        <td className="py-2 px-4">{rating}/10</td>
        <td className="py-2 px-4">{experienceText}</td>
        <td className="py-2 px-4">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
            {level.label}
          </span>
        </td>
      </>
    )
  }

  const handleEditClick = (item) => {
    setSelectedItem(item)
    setShowEditForm(true)
  }

  const handleFormClose = () => {
    setShowEditForm(false)
    setSelectedItem(null)
  }

  const handleFormSaved = () => {
    handleFormClose()
  }

  const skillFilter = (data) => {
    return data.filter(skill => (skill.proficiency || 0) >= 8).slice(0, 5)
  }

  return (
    <>
      <ReusableTable
        refreshTrigger={refreshTrigger}
        apiFunction={api.getUserSkills}
        userId={userId}
        columns={skillsColumns}
        renderCell={renderSkillCell}
        FormComponent={SkillForm}
        editTitle="Edit Skill"
        deleteTitle="Delete Skill"
        emptyMessage="No skills found."
        topRatedMessage="No top-rated skills found."
        loadingMessage="Loading skills..."
        updateFunction={api.updateUserSkill}
        deleteFunction={api.deleteUserSkill}
        getItemId={(item) => item.user_skill_id}
        getItemName={(item) => item.skill_name}
        showTopRatedOnly={showTopRatedOnly}
        filterFunction={showTopRatedOnly ? skillFilter : null}
        onEditClick={handleEditClick}
      />
      
      {showEditForm && (
<Modal isOpen={showEditForm} onClose={handleFormClose} title={selectedItem ? "Edit Skill" : "Add New Skill"}>
<SkillForm selectedSkill={selectedItem} onSaved={handleFormSaved} onCancel={handleFormClose} />
        </Modal>
      )}
    </>
  )
}