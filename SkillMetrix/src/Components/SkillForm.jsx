import { useEffect, useState, useRef, useCallback } from 'react';
import { api, calculateSkillLevel, getResolvedUserId } from '../API/userApi';
import Select from 'react-select';

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
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [selectedSkillOption, setSelectedSkillOption] = useState(null);

  const userId = getResolvedUserId();
  const isEditing = !!selectedSkill;
  const searchTimeoutRef = useRef(null);

  const fetchSkills = useCallback(async (query = '') => {
    setLoadingSkills(true);
    try {
      const skills = await api.getAvailableSkills(query);
      const formattedSkills = (skills.data || skills).map(skill => ({
        value: skill.skill_id || skill.id,
        label: skill.name || skill.skill_name,
      }));
      setAvailableSkills(formattedSkills);
    } catch (e) {
      setError((e?.response?.data?.message) || e.message || "Failed to load available skills.");
      setAvailableSkills([]);
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    if (selectedSkill) {
      const totalMonths = selectedSkill.months_experience || (selectedSkill.years_experience ? selectedSkill.years_experience * 12 : 0);
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      const skillId = selectedSkill.skill_id || selectedSkill.id;

      const defaultSkillOption = availableSkills.find(s => s.value === skillId);
      if (defaultSkillOption) {
        setSelectedSkillOption(defaultSkillOption);
      } else if (selectedSkill.name) {
        setSelectedSkillOption({
          value: skillId,
          label: selectedSkill.name
        });
      }

      setFormData({
        skill_id: skillId,
        rating: (selectedSkill.proficiency || selectedSkill.rating || '').toString(),
        experienceYears: years.toString(),
        experienceMonths: months.toString()
      });
    } else {
      setSelectedSkillOption(null);
      setFormData({ skill_id: "", rating: "", experienceYears: "", experienceMonths: "" });
    }
  }, [selectedSkill, availableSkills]);

  const handleSelectChange = (selectedOption) => {
    setSelectedSkillOption(selectedOption);
    setFormData(prev => ({
      ...prev,
      skill_id: selectedOption ? selectedOption.value : "",
    }));
    setError("");
  };

  const handleInputChange = (inputValue) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (inputValue) {
        fetchSkills(inputValue);
      } else {
        fetchSkills(); // Fetch all skills when input is cleared
      }
    }, 300);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!formData.skill_id) throw new Error("Please select a valid skill");
      const rating = Number(formData.rating);
      if (isNaN(rating) || rating < 1 || rating > 10) throw new Error("Please enter a valid rating between 1-10");
      const years = Number(formData.experienceYears) || 0;
      const months = Number(formData.experienceMonths) || 0;
      if (years < 0 || months < 0) throw new Error("Experience cannot be negative");
      if (months > 11) throw new Error("Months should be between 0-11");
      const totalMonths = (years * 12) + months;
      if (rating > 5 && totalMonths < 6) throw new Error("For ratings above 5, minimum 6 months experience is required");
      
      const skillData = {
        skill_id: formData.skill_id,
        proficiency: rating,
        months_experience: totalMonths
      };

      if (isEditing) {
        await api.updateUserSkill(userId, selectedSkill.user_skill_id, skillData);
      } else {
        await api.addUserSkill(userId, skillData);
      }
      if (onSaved) onSaved();
    } catch (e) {
      setError((e?.response?.data?.message) || e.message || (isEditing ? "Failed to update skill" : "Failed to add skill"));
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
          <Select
            id="skill_id"
            name="skill_id"
            options={availableSkills}
            value={selectedSkillOption}
            onChange={handleSelectChange}
            onInputChange={handleInputChange}
            placeholder="Select or type a skill"
            isDisabled={isEditing}
            isLoading={loadingSkills}
            isClearable
          />
          {isEditing && (
            <p className="text-xs text-gray-500 mt-2">Skill cannot be changed when editing</p>
          )}
        </div>
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Proficiency Rating (1-10)*
          </label>
          <select id="rating" name="rating" value={formData.rating} onChange={handleFormChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
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
              <input type="number" id="experienceYears" name="experienceYears" min="0" value={formData.experienceYears}
                onChange={handleFormChange} placeholder="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" />
            </div>
            <div>
              <label htmlFor="experienceMonths" className="block text-xs font-medium text-gray-600 mb-1">Months (0-11)</label>
              <select id="experienceMonths" name="experienceMonths" value={formData.experienceMonths} onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
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
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >Cancel
            </button>
          )}
          <button type="submit" disabled={loading || availableSkills.length === 0}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Skill" : "Add Skill")}
          </button>
        </div>
      </form>
    </ErrorBoundary>
  );
}
