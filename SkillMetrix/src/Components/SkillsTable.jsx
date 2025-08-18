import { useEffect, useState } from 'react'
import { api, calculateSkillLevel } from '../api/userApi'
import { getResolvedUserId } from '../utils/envConfig'
import { IoSearch } from "react-icons/io5"
import { CiFilter } from "react-icons/ci"
import { MdModeEdit } from "react-icons/md"
import { MdDelete } from "react-icons/md"
import Modal from '../Components/Modal'
import SkillForm from '../Components/SkillForm'
import DeleteModal from '../Components/DeleteModal'

export default function SkillsTable({ refreshTrigger, showTopRatedOnly = false }) {
const [loading,setLoading]=useState(true)
const [error,setError]=useState('')
const [skills,setSkills]=useState([])
const [filteredSkills,setFilteredSkills]=useState([])
const [showEditForm,setShowEditForm]=useState(false)
const [selectedSkillToEdit,setSelectedSkillToEdit]=useState(null)
const [showDeleteModal,setShowDeleteModal]=useState(false)
const [skillToDelete,setSkillToDelete]=useState(null)
const [deleteLoading,setDeleteLoading]=useState(false)
const userId=getResolvedUserId()

const refresh=async()=>{setLoading(true);
  setError('');
  try{const data=await api.getUserSkills(userId);
    const skillsArray=Array.isArray(data)?data:[];setSkills(skillsArray);
    if(showTopRatedOnly)
      {
        const topSkills=skillsArray.filter(function(skill){const rating=skill.proficiency?Number(skill.proficiency):0;return rating>=8}).slice(0,5);setFilteredSkills(topSkills)}
        else{setFilteredSkills(skillsArray)}}
        catch(e){let errorMessage='Failed to load skills';
          if(e&&e.response&&e.response.data&&e.response.data.message)
            {errorMessage=e.response.data.message}
          else if(e&&e.message){errorMessage=e.message}setError(errorMessage)}
          finally{setLoading(false)}}

useEffect(function(){refresh()},[userId])
useEffect(function(){if(refreshTrigger)refresh()},[refreshTrigger])

const handleDeleteClick=(skill)=>{setSkillToDelete(skill);setShowDeleteModal(true)}
const handleDeleteConfirm=async()=>
  {if(!skillToDelete)return;
    setDeleteLoading(true);
    try{await api.deleteUserSkill(userId,skillToDelete.user_skill_id);
      setShowDeleteModal(false);s
      setSkillToDelete(null);
      refresh()}
      catch(e)
      {let errorMessage='Failed to delete skill';
        if(e&&e.response&&e.response.data&&e.response.data.message)
          {errorMessage=e.response.data.message}
        else if(e&&e.message){errorMessage=e.message}alert(errorMessage)}
        finally{setDeleteLoading(false)}}
const handleDeleteCancel=()=>{setShowDeleteModal(false);setSkillToDelete(null)}
const handleEditClick=(skill)=>{console.log('Edit clicked for skill:',skill);
  setError('Edit skill functionality is currently unavailable');
  return}
const handleEditClose=()=>{setShowEditForm(false);setSelectedSkillToEdit(null)}
const handleEditSaved=()=>{setShowEditForm(false);setSelectedSkillToEdit(null);refresh()}

if(loading)return<div className="p-4">Loading skills...</div>
if(error)return<div className="text-red-600 p-4">{error}</div>

return(<>
<div className="w-full">
{error&&(<div className="text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-4">{error}</div>)}
<div className="flex justify-end gap-4 mb-4 text-gray-600 text-xl"><IoSearch className="cursor-pointer"/><CiFilter className="cursor-pointer"/></div>
{filteredSkills.length===0?(<div className="text-gray-500 p-4">{showTopRatedOnly?'No top-rated skills found.':'No skills found.'}</div>):(
<div className="overflow-x-auto">
<table className="min-w-full text-sm border border-gray-200">
<thead className="bg-gray-100 text-left text-gray-600 border-b">
<tr>
<th className="py-2 px-4 text-center">Skill</th>
<th className="py-2 px-4 text-center">Rating</th>
<th className="py-2 px-4 text-center">Experience</th>
<th className="py-2 px-4 text-center">Skill Level</th>
{!showTopRatedOnly&&<th className="py-2 px-4 text-center">Actions</th>}
</tr>
</thead>
<tbody>
{filteredSkills.map(function(skill){const skillId=skill.user_skill_id;
  const skillName=skill.skill_name;
  const rating=skill.proficiency?Number(skill.proficiency):0;
  const years=Math.floor(skill.years_experience?Number(skill.years_experience):0);
  const level=calculateSkillLevel(rating);
  return(
<tr key={skillId} className="border-b last:border-0 hover:bg-gray-50">
<td className="py-2 px-4 font-medium">{skillName}</td>
<td className="py-2 px-4">{rating}/10</td>
<td className="py-2 px-4">{years} {years===1?'year':'years'}</td>
<td className="py-2 px-4"><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>{level.label}</span></td>
{!showTopRatedOnly&&(
<td className="py-2 px-4 text-center flex justify-center gap-2">
<button onClick={()=>handleEditClick(skill)} className="bg-gray-400 text-white p-2 rounded cursor-not-allowed" disabled><MdModeEdit/></button>
<button onClick={()=>handleDeleteClick(skill)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600"><MdDelete/></button>
</td>
)}
</tr>)})}
</tbody>
</table>
</div>)}
</div>
{selectedSkillToEdit&&(<Modal isOpen={showEditForm} onClose={handleEditClose} title="Edit Skill" size="lg"><SkillForm selectedSkill={selectedSkillToEdit} onSaved={handleEditSaved} onCancel={handleEditClose}/></Modal>)}
{showDeleteModal&&(<DeleteModal isOpen={showDeleteModal} onClose={handleDeleteCancel} onConfirm={handleDeleteConfirm} title="Delete Skill" skillName={skillToDelete?.skill_name} isLoading={deleteLoading}/>)}
</>)
}
