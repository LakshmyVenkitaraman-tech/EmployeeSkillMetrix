import { useState, useEffect } from "react";
import { api } from "../api/userApi";

const USER_ID = 60041175820;

export default function SkillForm({ onSaved }) {
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [formData, setFormData] = useState({
    skill_id: "",
    rating: "",
    months: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAvailableSkills = async () => {
      try {
        const skills = await api.getAvailableSkills();
        console.log("Available skills:", skills);
        setAvailableSkills(Array.isArray(skills) ? skills : []);
      } catch (e) {
        console.error("Failed to load available skills:", e);
        setError("Failed to load available skills");
      }
    };
    loadAvailableSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(function(prev) {
      return { ...prev, [name]: value };
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.skill_id || isNaN(Number(formData.skill_id))) {
        throw new Error("Please select a valid skill");
      }
      if (!formData.rating || isNaN(Number(formData.rating))) {
        throw new Error("Please enter a valid rating");
      }
      if (!formData.months || isNaN(Number(formData.months))) {
        throw new Error("Please enter valid months of experience");
      }

      const skillData = {
        skill_id: Number(formData.skill_id),
        experience_in_months: Number(formData.months),
        proficiency: Number(formData.rating)
      };

      console.log("Final payload being sent:", skillData);

      await api.addUserSkill(USER_ID, skillData);

      setFormData({ skill_id: "", rating: "", months: "" });
      onSaved();

    } catch (e) {
      console.error("Failed to add skill:", e);
      if (e.response) {
        console.error("Full API error:", e.response.data);
        setError(e.response.data.message ? e.response.data.message : "Failed to add skill");
      } else {
        setError(e.message ? e.message : "Failed to add skill");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="skill_id" className="block text-sm font-medium text-gray-700 mb-1">Skill *</label>
        <select
          id="skill_id"
          name="skill_id"
          value={formData.skill_id}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">Select a skill</option>
          {availableSkills.map(function(skill) {
            return <option key={skill.skill_id} value={String(skill.skill_id)}>{skill.name}</option>;
          })}
        </select>
      </div>

      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (1-10) *</label>
        <input
          type="number"
          id="rating"
          name="rating"
          min="1"
          max="10"
          value={formData.rating}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Enter rating (1-10)"
        />
      </div>

      <div>
        <label htmlFor="months" className="block text-sm font-medium text-gray-700 mb-1">Experience (months) *</label>
        <input
          type="number"
          id="months"
          name="months"
          min="0"
          value={formData.months}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Enter total months of experience"
        />
        {formData.months && (
          <p className="text-xs text-gray-500 mt-1">
            = {Math.floor(Number(formData.months) / 12)} years {Number(formData.months) % 12} months
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Skill"}
        </button>
      </div>
    </form>
  );
}
