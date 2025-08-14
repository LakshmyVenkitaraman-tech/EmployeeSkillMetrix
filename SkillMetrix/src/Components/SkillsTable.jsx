import { useEffect, useState } from 'react';
import { api, calculateSkillLevel } from '../api/userApi';
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const USER_ID = 60041175820;
localStorage.setItem('user_id', USER_ID);

export default function SkillsTable({ refreshTrigger, showTopRatedOnly = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSkillToEdit, setSelectedSkillToEdit] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUserSkills(USER_ID);
      const skillsArray = Array.isArray(data) ? data : [];
      setSkills(skillsArray);
      if (showTopRatedOnly) {
        const topSkills = skillsArray.filter(function(skill) {
          const rating = skill.proficiency ? Number(skill.proficiency) : 0;
          return rating >= 8;
        }).slice(0, 5);
        setFilteredSkills(topSkills);
      } else {
        setFilteredSkills(skillsArray);
      }
    } catch (e) {
      let errorMessage = 'Failed to load skills';
      if (e && e.response && e.response.data && e.response.data.message) {
        errorMessage = e.response.data.message;
      } else if (e && e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() { 
    refresh(); 
  }, []);
  
  useEffect(function() { 
    if (refreshTrigger) refresh(); 
  }, [refreshTrigger]);

  const onDelete = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await api.deleteUserSkill(USER_ID, skillId);
      refresh();
    } catch (e) {
      let alertMessage = 'Failed to delete skill: Unknown error';
      if (e && e.response && e.response.data && e.response.data.message) {
        alertMessage = 'Failed to delete skill: ' + e.response.data.message;
      } else if (e && e.message) {
        alertMessage = 'Failed to delete skill: ' + e.message;
      }
      alert(alertMessage);
    }
  };

  const onEdit = (skill) => {
    setSelectedSkillToEdit(skill);
    setShowAddForm(true);
  };

  if (loading) return <div className="p-4">Loading skills...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="w-full">
      <div className="flex justify-end gap-4 mb-4 text-gray-600 text-xl">
        <IoSearch className="cursor-pointer" />
        <CiFilter className="cursor-pointer" />
      </div>

      {filteredSkills.length === 0 ? (
        <div className="text-gray-500 p-4">
          {showTopRatedOnly ? 'No top-rated skills found.' : 'No skills found.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-100 text-left text-gray-600 border-b">
              <tr>
                <th className="py-2 px-4 text-center">Skill</th>
                <th className="py-2 px-4 text-center">Rating</th>
                <th className="py-2 px-4 text-center ">Experience</th>
                <th className="py-2 px-4 text-center">Skill Level</th>
                {!showTopRatedOnly && <th className="py-2 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map(function(skill) {
                const skillId = skill.user_skill_id;
                const skillName = skill.skill_name;
                const rating = skill.proficiency ? Number(skill.proficiency) : 0;
                const years = Math.floor(skill.years_experience ? Number(skill.years_experience) : 0);
                const level = calculateSkillLevel(rating);

                return (
                  <tr key={skillId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{skillName}</td>
                    <td className="py-2 px-4">{rating}/10</td>
                    <td className="py-2 px-4">{years} {years === 1 ? 'year' : 'years'}</td>
                    <td className="py-2 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                        {level.label}
                      </span>
                    </td>
                    {!showTopRatedOnly && (
                      <td className="py-2 px-4 text-center flex justify-center gap-2">
                        <button 
                          onClick={() => onEdit(skill)} 
                          className="bg-blue-500 text-white p-2 rounded"
                        >
                          <MdModeEdit />
                        </button>
                        <button 
                          onClick={() => onDelete(skillId)} 
                          className="bg-red-500 text-white p-2 rounded"
                        >
                          <MdDelete />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <AddSkillModal  
          selectedSkill={selectedSkillToEdit} 
          onClose={() => {
            setShowAddForm(false); 
            setSelectedSkillToEdit(null);
          }}
          onSaved={() => {
            refresh();
            setShowAddForm(false);
            setSelectedSkillToEdit(null);
          }}
        />
      )}
    </div>
  );
}
