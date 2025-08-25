import { useEffect, useState } from 'react';
import { api, calculateSkillLevel, getResolvedUserId } from '../api/userApi';

function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = (error) => {
      setHasError(true);
      console.error('SkillForm Error:', error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  if (hasError) return fallback || <div className="text-red-600 p-4">Something went wrong. Please try again.</div>;
  return children;
}

export default function SkillForm({ onSaved, selectedSkill = null, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [formData, setFormData] = useState({ skill_id: "", rating: "", experienceYears: "", experienceMonths: "" });
  const [error, setError] = useState("");
  const userId = getResolvedUserId();
  const isEditing = !!selectedSkill;

  useEffect(() => {
    async function loadAvailableSkills() {
      try {
        const skills = await api.getAvailableSkills();
        if (Array.isArray(skills)) setAvailableSkills(skills);
        else if (skills && Array.isArray(skills.data)) setAvailableSkills(skills.data);
        else setAvailableSkills([]);
      } catch (e) {
        setError((e && e.response && e.response.data && e.response.data.message) || e.message || "Failed to load available skills");
      }
    }
    loadAvailableSkills();
  }, []);

  useEffect(() => {
    if (selectedSkill) {
      const totalYears = selectedSkill.years_experience || 0;
      const years = Math.floor(totalYears);
      const months = Math.round((totalYears - years) * 12);
      const skillId = selectedSkill.skill_id || selectedSkill.id || "";
      setFormData({
        skill_id: skillId.toString(),
        rating: (selectedSkill.proficiency || "").toString(),
        experienceYears: years.toString(),
        experienceMonths: months.toString()
      });
    } else {
      setFormData({ skill_id: "", rating: "", experienceYears: "", experienceMonths: "" });
    }
  }, [selectedSkill]);

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
      if (!formData.skill_id || isNaN(Number(formData.skill_id))) throw new Error("Please select a valid skill");
      if (!formData.rating || isNaN(Number(formData.rating)) || Number(formData.rating) < 1 || Number(formData.rating) > 10) throw new Error("Please enter a valid rating between 1-10");
      const years = Number(formData.experienceYears) || 0;
      const months = Number(formData.experienceMonths) || 0;
      if (years < 0 || months < 0) throw new Error("Experience cannot be negative");
      if (months > 11) throw new Error("Months should be between 0-11");
      const totalMonths = (years * 12) + months;
      const rating = Number(formData.rating);
      if (rating > 5 && totalMonths < 6) throw new Error("For ratings above 5, minimum 6 months experience is required");
      const totalYears = totalMonths / 12;
      const skillData = { skill_id: Number(formData.skill_id), proficiency: rating, years_experience: totalYears };
      if (isEditing) {
        await api.updateUserSkill(userId, selectedSkill.user_skill_id, skillData);
      } else {
        await api.addUserSkill(userId, skillData);
      }
      setFormData({ skill_id: "", rating: "", experienceYears: "", experienceMonths: "" });
      if (onSaved) onSaved();
    } catch (e) {
      setError((e && e.response && e.response.data && e.response.data.message) || e.message || (isEditing ? "Failed to update skill" : "Failed to add skill"));
    } finally {
      setLoading(false);
    }
  };

  const isValidRating = () => {
    const rating = Number(formData.rating);
    return !isNaN(rating) && rating >= 1 && rating <= 10 && String(formData.rating).trim() !== "";
  };

  return (
    <ErrorBoundary>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          </div>
        )}
        <div>
          <label htmlFor="skill_id" className="block text-sm font-medium text-gray-700 mb-2">
            Skill <span className="text-red-500">*</span>
          </label>
          <select
            id="skill_id"
            name="skill_id"
            value={formData.skill_id}
            onChange={handleChange}
            required
            disabled={isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          >
            <option value="">Select a skill</option>
            {availableSkills.map(skill => {
              const skillId = skill.id || skill.skill_id;
              const skillName = skill.name || skill.skill_name;
              return <option key={skillId} value={skillId}>{skillName}</option>;
            })}
          </select>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-2">Skill cannot be changed when editing</p>
          )}
          {availableSkills.length === 0 && !error && (
            <p className="text-sm text-gray-500 mt-2">Loading skills...</p>
          )}
        </div>
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Proficiency Rating (1-10)*
          </label>
 <select id="rating" name="rating" value={formData.rating}   onChange={handleChange}  required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg " >
            <option value="">Select rating</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            1-3 Beginner, 4-6 Intermediate, 7-10 Advanced
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Duration</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="experienceYears" className="block text-xs font-medium text-gray-600 mb-1">Years</label>
  <input   type="number" id="experienceYears" name="experienceYears" min="0"  value={formData.experienceYears}
        onChange={handleChange} placeholder="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg " />
            </div>
            <div>
              <label htmlFor="experienceMonths" className="block text-xs font-medium text-gray-600 mb-1">Months (0-11)</label>
    <select id="experienceMonths" name="experienceMonths"  value={formData.experienceMonths}  onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg ">
                <option value="">Select months</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            For ratings above 5, minimum 6 months experience is required
          </p>
        </div>
        {isValidRating() && (
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level Preview</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${calculateSkillLevel(Number(formData.rating)).color}`}>
              {calculateSkillLevel(Number(formData.rating)).label}
            </span>
          </div>
        )}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          {onCancel && (
   <button type="button" onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 "
            >Cancel
            </button>
          )}
  <button type="submit" disabled={loading || availableSkills.length === 0}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700  disabled:cursor-not-allowed ">
            {loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Skill" : "Add Skill")}
          </button>
        </div>
      </form>
    </ErrorBoundary>
  );
}