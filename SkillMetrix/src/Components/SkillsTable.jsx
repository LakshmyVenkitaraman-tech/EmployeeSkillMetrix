import { useState, useEffect, useCallback } from 'react';
import { getResolvedUserId } from '../Utils/envConfig';
import ReusableTable from '../Components/ReusableTable';
import { api, calculateSkillLevel } from '../API/userApi';
import SkillForm from '../Components/SkillForm';
import { IoSearchSharp } from "react-icons/io5";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default function SkillsTable({ refreshTrigger, showTopRatedOnly = false }) {
  const userId = getResolvedUserId();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const skills = await api.getUserSkills(userId);
      setAllSkills(skills);
    } catch (err) {
      setError('Failed to fetch skills.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAllSkills();
  }, [fetchAllSkills, refreshTrigger]);

  const formatExperience = (yearsExperience) => {
    const totalMonths = Math.round(yearsExperience * 12);
    if (totalMonths < 12) {
      return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'}`;
    }
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${years}.${remainingMonths} years`;
  };

  const skillsColumns = ["Skill", "Rating", "Experience", "Skill Level"];

  const renderSkillCell = (skill) => {
    const skillName = skill.skill_name;
    const rating = skill.proficiency ? Number(skill.proficiency) : 0;
    const experienceText = formatExperience(skill.years_experience || 0);
    const level = calculateSkillLevel(rating);

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
    );
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setShowEditForm(true);
  };

  const handleFormClose = () => {
    setShowEditForm(false);
    setSelectedItem(null);
  };

  const handleFormSaved = () => {
    handleFormClose();
    fetchAllSkills();
  };

  const skillFilter = (data) => {
    return data.filter(skill => (skill.proficiency || 0) >= 8).slice(0, 5);
  };

  const filteredSkills = allSkills.filter(skill =>
    (skill.skill_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const finalSkillsToRender = showTopRatedOnly ? skillFilter(filteredSkills) : filteredSkills;
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <label htmlFor="skill-search" className="sr-only">Search skills...</label>
          <input
            id="skill-search"
            name="skill-search"
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <IoSearchSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <ReusableTable
        data={finalSkillsToRender}
        columns={skillsColumns}
        renderCell={renderSkillCell}
        editTitle="Edit Skill"
        deleteTitle="Delete Skill"
        emptyMessage={searchTerm ? "No skills found matching your search." : "No skills found."}
        updateFunction={api.updateUserSkill}
        deleteFunction={api.deleteUserSkill}
        getItemId={(item) => item.user_skill_id}
        getItemName={(item) => item.skill_name}
        onEditClick={handleEditClick}
      />
      
      <Modal isOpen={showEditForm} onClose={handleFormClose} title={selectedItem ? "Edit Skill" : "Add New Skill"}>
        <SkillForm selectedSkill={selectedItem} onSaved={handleFormSaved} onCancel={handleFormClose} />
      </Modal>
    </>
  );
}
