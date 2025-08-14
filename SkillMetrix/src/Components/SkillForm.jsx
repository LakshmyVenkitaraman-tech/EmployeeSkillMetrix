import { useEffect, useState } from 'react';
import { api, calculateSkillLevel } from '../api/userApi';

const USER_ID = 60041175820;
localStorage.setItem('user_id', USER_ID);

export default function SkillForm({ onSaved }) {
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [formData, setFormData] = useState({ skill_id: "", rating: " ",experienceYears: " ",experienceMonths: " "});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAvailableSkills() {
      try {
        console.log("Loading available skills...");
        const skills = await api.getAvailableSkills();
        console.log("Received skills:", skills);
        
        if (Array.isArray(skills)) {
          setAvailableSkills(skills);
        } else if (skills && Array.isArray(skills.data)) {
          setAvailableSkills(skills.data);
        } else {
          console.error("Unexpected skills format:", skills);
          setAvailableSkills([]);
        }
      } catch (e) {
        console.error("Error loading skills:", e);
        let errorMessage = "Failed to load available skills";
        if (e.response && e.response.data && e.response.data.message) {
          errorMessage = e.response.data.message;
        } else if (e.message) {
          errorMessage = e.message;
        }
        setError(errorMessage);
      }
    }
    loadAvailableSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
   
      if (!formData.skill_id || isNaN(Number(formData.skill_id)))
        throw new Error("Please select a valid skill");
      if (!formData.rating || isNaN(Number(formData.rating)) || Number(formData.rating) < 1 || Number(formData.rating) > 10)
        throw new Error("Please enter a valid rating between 1-10");
      
      const years = Number(formData.experienceYears) || 0;
      const months = Number(formData.experienceMonths) || 0;
      
      if (years < 0 || months < 0)
        throw new Error("Experience cannot be negative");
      if (months > 11)
        throw new Error("Months should be between 0-11");
      const totalYears = years + Math.floor(months / 12);
      const skillData = {skill_id: Number(formData.skill_id),proficiency: Number(formData.rating),years_experience: totalYears};

      console.log("Sending payload:", skillData);

      await api.addUserSkill(USER_ID, skillData);

      setFormData({ skill_id: "", rating: "", experienceYears: "", experienceMonths: "" });

      if (onSaved) onSaved();
    } catch (e) {
      console.error("Error adding skill:", e);
      let errorMessage = "Failed to add skill";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded"> {error}</div>)}
      <div>
        <label htmlFor="skill_id" className="block text-sm font-medium text-gray-700 mb-1"> Skill * </label>
<select id="skill_id" name="skill_id" value={formData.skill_id} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md ">
        
 <option value="">Select a skill</option>
 {availableSkills.map(skill => {
            const skillId = skill.id || skill.skill_id;
            const skillName = skill.name || skill.skill_name;
            return (
              <option key={skillId} value={skillId}> {skillName} </option>);
          })}
        </select>
        {availableSkills.length === 0 && !error && (
          <p className="text-sm text-gray-500 mt-1">Loading skills...</p>
        )}
      </div>

<div>
 <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (1-10) *</label>
<input type="number" id="rating" name="rating" min="1" max="10" value={formData.rating} onChange={handleChange} required
          className="w-full p-2 border border-gray-300 rounded-md "/>
      </div>
<div>
<label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) </label>
<input type="number" id="experience" min="0" value={formData.experienceYears} onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md " />
      </div>
<div>
<label htmlFor="experienceMonths" className="block text-sm font-medium text-gray-700 mb-1"> Experience (Months 0-11) </label>
<input type="number" id="experienceMonths" name="experienceMonths" min="0" max="11" value={formData.experienceMonths} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md " />
      </div>

{formData.rating && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skill Level
          </label>
          <div>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${calculateSkillLevel(Number(formData.rating)).color}`}>
              {calculateSkillLevel(Number(formData.rating)).label}
            </span>
          </div>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading || availableSkills.length === 0}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Adding..." : "Add Skill"}
      </button>
    </form>
  );
}