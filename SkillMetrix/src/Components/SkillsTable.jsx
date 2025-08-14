import { useEffect, useState } from 'react';
import { api, calculateSkillLevel } from '../api/userApi';

const USER_ID = 60041175820;
localStorage.setItem('user_id', USER_ID);

export default function SkillsTable({ refreshTrigger, showTopRatedOnly = false, enableSearch = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState(null);

  
  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUserSkills(USER_ID);
      const skillsArray = Array.isArray(data) ? data : [];
      setSkills(skillsArray);
      if (showTopRatedOnly) {
        const topSkills = skillsArray.filter(skill => {
          const rating = skill.proficiency ? Number(skill.proficiency) : 0;
          return rating >= 8;
        }).slice(0, 5); 
        setFilteredSkills(topSkills);
      } else {
        setFilteredSkills(skillsArray);
      }
    } catch (e) {
      let errorMessage = 'Failed to load skills';
      if (e.response && e.response.data && e.response.data.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const loadAvailableSkills = async () => {
    if (!enableSearch) return;
    try {
      const data = await api.getAvailableSkills();
      setAvailableSkills(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load available skills for search:', e);
    }
  };

  useEffect(() => { 
    refresh(); 
    loadAvailableSkills();
  }, []);
  
  useEffect(() => { 
    if (refreshTrigger) refresh(); 
  }, [refreshTrigger]);
  useEffect(() => {
    if (!enableSearch) return;

    if (!searchTerm) {
      if (showTopRatedOnly) {
        const topSkills = skills.filter(skill => {
          const rating = skill.proficiency ? Number(skill.proficiency) : 0;
          return rating >= 8;
        }).slice(0, 5);
        setFilteredSkills(topSkills);
      } else {
        setFilteredSkills(skills);
      }
      return;
    }
    const filtered = skills.filter(skill => {
      const skillName = skill.skill_name || '';
      return skillName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setFilteredSkills(filtered);
  }, [searchTerm, skills, enableSearch, showTopRatedOnly]);

  const onDelete = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await api.deleteUserSkill(USER_ID, skillId);
      refresh();
    } catch (e) {
      let alertMessage = 'Failed to delete skill: Unknown error';
      if (e.response && e.response.data && e.response.data.message) {
        alertMessage = 'Failed to delete skill: ' + e.response.data.message;
      } else if (e.message) {
        alertMessage = 'Failed to delete skill: ' + e.message;
      }
      alert(alertMessage);
    }
  };
  const handleAddSkillFromSearch = (skill) => {
    setSelectedSkillToAdd(skill);
    setShowAddForm(true);
  };
  const isSkillAlreadyAdded = (skillId) => {
    return skills.some(userSkill => {
      const userSkillId = userSkill.skill_id || userSkill.id;
      return Number(userSkillId) === Number(skillId);
    });
  };
  const getAvailableSkillsForSearch = () => {
    if (!searchTerm) return [];
    return availableSkills.filter(skill => {
      const skillId = skill.id || skill.skill_id;
      const skillName = skill.name || skill.skill_name || '';
      const matchesSearch = skillName.toLowerCase().includes(searchTerm.toLowerCase());
      const notAlreadyAdded = !isSkillAlreadyAdded(skillId);
      
      return matchesSearch && notAlreadyAdded;
    }).slice(0, 3); 
  };

  const handleFilterClick = () => {
    alert('');
  };

  if (loading) return <div className="p-4">Loading skills...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="w-full">
      {enableSearch && (
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
<input type="text" placeholder="Search skills.." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md "/>
            </div>
<button onClick={handleFilterClick}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 ">Filter </button>
 <button onClick={()=>setShowAddForm(true)}  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">+Add skill</button>
          </div>
    {searchTerm && enableSearch && (
      <div className="border border-gray-200 rounded-md bg-white">
        {filteredSkills.length > 0 && (
         <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Skills</h4>
          {filteredSkills.slice(0, 3).map(skill => {
                    const skillId = skill.user_skill_id;
                    const skillName = skill.skill_name;
                    const rating = skill.proficiency ? Number(skill.proficiency) : 0;
                    const level = calculateSkillLevel(rating);
        return (
          <div key={skillId} className="text-sm text-gray-600 mb-1">
                {skillName} - <span className={level.color}>{level.label}</span> ({rating}/10)</div>
                    );
                  })}
                </div>
              )}
              
  {getAvailableSkillsForSearch().length > 0 && ( <div className="p-3">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Skills</h4>
      {getAvailableSkillsForSearch().map(skill => {
                    const skillId = skill.id || skill.skill_id;
                    const skillName = skill.name || skill.skill_name;
        return (
              <div key={skillId} className="flex justify-between items-center mb-2 last:mb-0">
              <span className="text-sm text-gray-600">{skillName}</span>
 <button onClick={() => handleAddSkillFromSearch(skill)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded"> Add</button>
                      </div>
                    );
                  })}
                </div>
              )}

  {filteredSkills.length === 0 && getAvailableSkillsForSearch().length === 0 && searchTerm && (
                <div className="p-3 text-sm text-gray-500">
                  No skills found matching "
                </div>
              )}</div>
          )}
        </div>
      )}

{(!searchTerm || filteredSkills.length > 0) && (
        <>{showTopRatedOnly && ( <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Rated Skills</h3>
          )}
          
{filteredSkills.length === 0 ? (
<div className="text-gray-500 p-4">
              {showTopRatedOnly ? 'No top-rated skills found.' : 'No skills found.'}
            </div> ) : (
    <div className="overflow-x-auto">
    <table className="min-w-full text-sm border border-gray-200">
      <thead className="bg-gray-100 text-left text-gray-600 border-b">
        <tr>
                    <th className="py-2 px-4">Skill</th>
                    <th className="py-2 px-4">Rating</th>
                    <th className="py-2 px-4">Experience</th>
                    <th className="py-2 px-4">Skill Level</th>
                    {!showTopRatedOnly && <th className="py-2 px-4">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredSkills.map(skill => {
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
            <td className={`py-2 px-4`}>
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>{level.label} </span>
          </td>
                        {!showTopRatedOnly && (
                          <td className="py-2 px-4">
        <button onClick={() => onDelete(skillId)} className=" bg-red-500 text-white px-3 py-1 rounded">Delete </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                    </table>
               </div>
          )}
        </>
      )}
      {showAddForm && (
  <AddSkillModal  selectedSkill={selectedSkillToAdd} onClose={()=>{setShowAddForm(false); selectedSkillToAdd(null);}}
        onSaved={()=>{
          refresh();
           setShowAddForm(false);
            setSelectedSkillToAdd(null);
        }}
        />
      )}
    </div>
  );
}

