import { useEffect, useState } from 'react';
import { api, calculateSkillLevel } from '../api/userApi';
import { getResolvedUserId } from '../utils/envConfig';

function ErrorBoundary({ children, fallback }) {
const [hasError, setHasError] = useState(false);
useEffect(() => {
const handleError = (error) => {
console.error('SkillForm Error:', error);
setHasError(true);
};
window.addEventListener('error', handleError);
return () => window.removeEventListener('error', handleError);
}, []);
if (hasError) {
return fallback || <div className="text-red-600 p-4">Something went wrong. Please try again.</div>;
}
return children;
}

export default function SkillForm({ onSaved, selectedSkill = null, onCancel }) {
const [loading, setLoading] = useState(false);
const [availableSkills, setAvailableSkills] = useState([]);
const [formData, setFormData] = useState({ 
skill_id: "", 
rating: "", 
experienceYears: "", 
experienceMonths: "" 
});
const [error, setError] = useState("");
const userId = getResolvedUserId();
const isEditing = !!selectedSkill;

useEffect(() => {
async function loadAvailableSkills() {
try {
const skills = await api.getAvailableSkills();
if (Array.isArray(skills)) {
setAvailableSkills(skills);
} else if (skills && Array.isArray(skills.data)) {
setAvailableSkills(skills.data);
} else {
setAvailableSkills([]);
}
} catch (e) {
let errorMessage = "Failed to load available skills";
if (e && e.response && e.response.data && e.response.data.message) {
errorMessage = e.response.data.message;
} else if (e && e.message) {
errorMessage = e.message;
}
setError(errorMessage);
}
}
loadAvailableSkills();
}, []);

useEffect(() => {
if (selectedSkill) {
console.log('Selected skill for editing:', selectedSkill);
const years = Math.floor(selectedSkill.years_experience || 0);
const months = Math.round((selectedSkill.years_experience - years) * 12);
const skillId = selectedSkill.skill_id || selectedSkill.id || "";
setFormData({
skill_id: skillId.toString(),
rating: (selectedSkill.proficiency || "").toString(),
experienceYears: years.toString(),
experienceMonths: months.toString()
});
} else {
setFormData({ 
skill_id: "", 
rating: "", 
experienceYears: "", 
experienceMonths: "" 
});
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
const skillData = {
skill_id: Number(formData.skill_id),
proficiency: Number(formData.rating),
years_experience: totalYears
};
if (isEditing) {
throw new Error("Edit skill functionality is currently unavailable");
} else {
await api.addUserSkill(userId, skillData);
}
setFormData({ skill_id: "", rating: "", experienceYears: "", experienceMonths: "" });
if (onSaved) onSaved();
} catch (e) {
let errorMessage = isEditing ? "Failed to update skill" : "Failed to add skill";
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

const isValidRating = () => {
const rating = Number(formData.rating);
return !isNaN(rating) && rating >= 1 && rating <= 10 && formData.rating.trim() !== "";
};

return (
<ErrorBoundary>
<form onSubmit={handleSubmit} className="space-y-4">
{error && (
<div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
{error}
</div>
)}
<div>
<label htmlFor="skill_id" className="block text-sm font-medium text-gray-700 mb-1">
Skill *
</label>
<select id="skill_id" name="skill_id" value={formData.skill_id} onChange={handleChange} required disabled={isEditing} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed">
<option value="">Select a skill</option>
{availableSkills.map(skill => {
const skillId = skill.id || skill.skill_id;
const skillName = skill.name || skill.skill_name;
return (
<option key={skillId} value={skillId}>
{skillName}
</option>
);
})}
</select>
{isEditing && (
<p className="text-xs text-gray-500 mt-1">Skill cannot be changed when editing</p>
)}
{availableSkills.length === 0 && !error && (
<p className="text-sm text-gray-500 mt-1">Loading skills...</p>
)}
</div>
<div>
<label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
Rating (1-10) *
</label>
<input type="number" id="rating" name="rating" min="1" max="10" value={formData.rating} onChange={handleChange} placeholder="Enter rating" required className="w-full p-2 border border-gray-300 rounded-md" />
</div>
<div className="flex gap-4">
<div className="flex-1">
<label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">
Experience (Years)
</label>
<input type="number" id="experienceYears" name="experienceYears" min="0" value={formData.experienceYears} onChange={handleChange} placeholder="Years" className="w-full p-2 border border-gray-300 rounded-md" />
</div>
<div className="flex-1">
<label htmlFor="experienceMonths" className="block text-sm font-medium text-gray-700 mb-1">
Experience (Months 0-11)
</label>
<input type="number" id="experienceMonths" name="experienceMonths" min="0" max="11" value={formData.experienceMonths} onChange={handleChange} placeholder="Months" className="w-full p-2 border border-gray-300 rounded-md" />
</div>
</div>
{isValidRating() && (
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
<div className="flex gap-3 justify-end pt-4">
{onCancel && (
<button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
Cancel
</button>
)}
<button type="submit" disabled={loading || availableSkills.length === 0} className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50">
{loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Skill" : "Add Skill")}
</button>
</div>
</form>
</ErrorBoundary>
);
}