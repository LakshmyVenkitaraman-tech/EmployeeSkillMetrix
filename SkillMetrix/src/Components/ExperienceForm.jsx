import { useState, useEffect } from 'react';
import { api, getResolvedUserId } from '../API/userApi';
import { MdDelete } from "react-icons/md";
import Select from "react-select";

export default function ExperienceForm({ selectedExperience, onSaved, onCancel }) {
  const [formData, setFormData] = useState({
    company_name: '',
    designation: '',
    start_date: '',
    end_date: '',
    currently_working: false,
    total_years_experience: '',
    relevant_years_experience: '',
    relevant_months_experience: '',
    employment_type: '',
    city: '',
    country: '',
    skills: []
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [skillsList, setSkillsList] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const userId = getResolvedUserId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, skills, countriesData] = await Promise.all([
          api.getEmploymentTypes(),
          api.getAvailableSkills(),
          api.getCountries(),
        ]);
        const formattedCountries = countriesData.map(c => ({
          value: c.code,
          label: c.name
        }));

        setEmploymentTypes(types);
        setSkillsList(skills);
        setCountries(formattedCountries);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setSkillsList([]);
        setEmploymentTypes([]);
        setCountries([]);
      } finally {
        setLoadingTypes(false);
        setLoadingSkills(false);
        setLoadingCountries(false);
      }
    };

    fetchData();

    if (selectedExperience) {
      console.log('Selected Experience:', selectedExperience);
      const [city, country] = selectedExperience.location ? selectedExperience.location.split(', ').map(item => item.trim()) : ['', ''];
      // The useEffect dependency on 'countries' ensures this runs after countries are loaded
      const defaultCountry = countries.find(c => c.label === country);

      setFormData({
        company_name: selectedExperience.company_name || selectedExperience.company || '',
        designation: selectedExperience.designation || selectedExperience.job_title || '',
        start_date: selectedExperience.start_date ? selectedExperience.start_date.split('T')[0] : '',
        end_date: selectedExperience.end_date ? selectedExperience.end_date.split('T')[0] : '',
        currently_working: !selectedExperience.end_date,
        total_years_experience: selectedExperience.total_years_experience || '',
        relevant_years_experience: selectedExperience.relevant_years_experience || '',
        relevant_months_experience: selectedExperience.relevant_months_experience || '',
        employment_type: selectedExperience.employment_type || '',
        city: city || '',
        country: country || '',
        skills: selectedExperience.skills.map(s => ({
          skill: s.name,
          years: Math.floor((s.months_experience || 0) / 12),
          months: (s.months_experience || 0) % 12,
        }))
      });
      setSelectedCountry(defaultCountry);
    }
  }, [selectedExperience, userId, countries]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'currently_working' && checked) {
      setFormData(prev => ({ ...prev, end_date: '' }));
    }
  };

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setFormData(prev => ({
      ...prev,
      country: selectedOption ? selectedOption.label : ''
    }));
  };

  const handleSkillAdd = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { skill: '', years: '', months: '' }]
    }));
  };

  const handleSkillChange = (index, field, value) => {
    setFormData(prev => {
      const updatedSkills = prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      );
      return { ...prev, skills: updatedSkills };
    });
  };

  const handleSkillRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');

    try {
      const selectedType = employmentTypes.find(type =>
        type.employment_type_name === formData.employment_type
      );

      const formattedSkills = formData.skills
        .filter(skill => skill.skill.trim() !== '')
        .map(skill => {
          const selectedSkill = skillsList.find(s =>
            s.name && s.name.toLowerCase() === skill.skill.toLowerCase()
          );
          if (selectedSkill) {
            return {
              skill_id: selectedSkill.skill_id,
              months_experience: (Number(skill.years || 0) * 12) + Number(skill.months || 0)
            };
          }
          return null;
        })
        .filter(skill => skill !== null);

      const location = formData.city && formData.country ? `${formData.city}, ${formData.country}` : formData.city || formData.country || '';

      const submitData = {
        company_name: formData.company_name,
        location: location,
        designation: formData.designation,
        start_date: formData.start_date,
        end_date: formData.currently_working ? null : formData.end_date,
        employment_type_id: selectedType ? selectedType.employment_type_id : null,
        relevant_years: Number(formData.relevant_years_experience) || 0,
        relevant_months: Number(formData.relevant_months_experience) || 0,
        skills: formattedSkills
      };

      if (selectedExperience) {
        const experienceId = selectedExperience.employment_history_id || selectedExperience.id;
        await api.updateEmploymentHistory(userId, experienceId, submitData);
      } else {
        await api.addEmploymentHistory(userId, submitData);
      }
      onSaved();
    } catch (err) {
      let errorMessage = 'Failed to save experience';
      if (err && err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 relative">
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-800 text-sm">{apiError}</div>
          </div>
        </div>
      )}
      
      {/* Scrollable Container for Skills */}
      <div className="overflow-y-auto max-h-[50vh] space-y-8 pr-4">
        {/* Basic Details Section */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-6">Basic Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange}
                placeholder="Enter Company Name" required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation <span className="text-red-500">*</span></label>
              <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Enter Designation"
                required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange}
                required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              {formData.currently_working ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                  Currently working here
                </div>
              ) : (
                <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              )}
              <div className="flex items-center mt-3">
                <input type="checkbox" name="currently_working" id="currently_working" onChange={handleInputChange}
                  checked={formData.currently_working} className="h-4 w-4 text-orange-600 border-gray-300 rounded" />
                <label htmlFor="currently_working" className="ml-3 text-sm text-gray-700">I currently work here</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Years of Experience</label>
              <input type="number" onChange={handleInputChange} name="total_years_experience" value={formData.total_years_experience}
                placeholder="Years" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relevant Experience <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" name="relevant_years_experience" value={formData.relevant_years_experience} onChange={handleInputChange} placeholder="Years"
                  min="0" required className="px-4 py-3 border border-gray-300 rounded-lg" />
                <select name="relevant_months_experience" value={formData.relevant_months_experience} onChange={handleInputChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Months</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type <span className="text-red-500">*</span></label>
              {loadingTypes ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <select name="employment_type" value={formData.employment_type} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Select Employment Type</option>
                  {employmentTypes.map(type => (
                    <option key={type.employment_type_id} value={type.employment_type_name}>{type.employment_type_name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                  placeholder="Enter City" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                {loadingCountries ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <Select options={countries} value={selectedCountry} onChange={handleCountryChange} placeholder="Select Country" isClearable />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Skills Learnt Section */}
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-6">Skills Learnt</h2>
          <div className="space-y-4">
            {formData.skills.map((skill, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
                    {loadingSkills ? (
                      <p className="text-gray-500">Loading...</p>
                    ) : (
                      <Select options={skillsList.map(s => ({ value: s.skill_id, label: s.name }))}
                        value={skillsList.find(s => s.name === skill.skill) ? { value: skillsList.find(s => s.name === skill.skill).skill_id, label: skill.skill } : null}
                        onChange={(selectedOption) => handleSkillChange(index, 'skill', selectedOption ? selectedOption.label : '')} placeholder="Select or type a skill"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={skill.years} onChange={(e) => handleSkillChange(index, 'years', e.target.value)}
                        placeholder="Years" min="0" className="px-3 py-3 border border-gray-300 rounded-lg" />
                      <select value={skill.months} onChange={(e) => handleSkillChange(index, 'months', e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-lg">
                        <option value="">Months</option>
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
                  <button type="button" onClick={() => handleSkillRemove(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                    <MdDelete className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={handleSkillAdd}
              className="text-orange-600 hover:text-orange-700 font-medium py-2 px-4 border-2 border-orange-300 rounded-lg">
              + Add Skill</button>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
          Cancel</button>
        <button type="submit" disabled={loading}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:cursor-not-allowed">
          {loading ? 'Saving...' : selectedExperience ? 'Update Experience' : 'Add Experience'}
        </button>
      </div>
    </form>
  );
}