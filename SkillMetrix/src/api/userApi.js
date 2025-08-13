import axios from "axios";

const API_BASE = "https://insights-api.terrificminds.com";

export const api = {
  async getUserProfile(userId) {
    const res = await axios.get(`${API_BASE}/user/${userId}/profile`);
    return res.data?.data || res.data;
  },
    
  async getUserEmploymentHistory(userId) {
    const res = await axios.get(`${API_BASE}/user/${userId}/employment-history`);
    return res.data?.data || res.data;
  },
  
  async addEmploymentHistory(userId, historyData) {
    const res = await axios.post(`${API_BASE}/user/${userId}/employment-history`, historyData);
    return res.data?.data || res.data;
  },
  
  async updateEmploymentHistory(userId, historyId, historyData) {
    const res = await axios.put(`${API_BASE}/user/${userId}/employment-history/${historyId}`, historyData);
    return res.data?.data || res.data;
  },
  
  async deleteEmploymentHistory(userId, historyId) {
    const res = await axios.delete(`${API_BASE}/user/${userId}/employment-history/${historyId}`);
    return res.data?.data || res.data;
  },
    
  async getUserSkills(userId) {
    const res = await axios.get(`${API_BASE}/user/${userId}/skills`);
    return res.data?.data || res.data;
  },
  
  async addUserSkill(userId, skillData) {
    console.log('Adding skill for user:', userId);
    console.log('Skill data being sent:', skillData);
    const res = await axios.post(`${API_BASE}/user/${userId}/skills`, skillData);
    return res.data?.data || res.data;
  },
  
  async updateUserSkill(userId, skillId, skillData) {
    const res = await axios.put(`${API_BASE}/user/${userId}/skills/${skillId}`, skillData);
    return res.data?.data || res.data;
  },
  
  async deleteUserSkill(userId, skillId) {
    const res = await axios.delete(`${API_BASE}/user/${userId}/skills/${skillId}`);
    return res.data?.data || res.data;
  },
  
  async getEmploymentTypes() {
    const res = await axios.get(`${API_BASE}/employment-types`);
    return res.data?.data || res.data;
  },
  
  async getAvailableSkills() {
    const res = await axios.get(`${API_BASE}/skills`);
    return res.data?.data || res.data;
  }
};

// Resolve user id from URL query, localStorage, or env
export const getResolvedUserId = () => {
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get('userId');
    if (fromQuery) {
      localStorage.setItem('user_id', fromQuery);
      return fromQuery;
    }
  } catch {}
  
  // Check for both lowercase and uppercase versions in localStorage
  const fromStorage = typeof window !== 'undefined' 
    ? localStorage.getItem('user_id') || localStorage.getItem('USER_ID')
    : null;
  if (fromStorage) return fromStorage;
  
  const fromEnv = typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_USER_ID;
  return fromEnv || 60041175820; // Use your actual user ID as fallback instead of 1
};

export const calculateSkillLevel = (rating) => {
  if (rating >= 8) return { label: "ADVANCED", color: "bg-green-100 text-green-800" };
  if (rating >= 6) return { label: "INTERMEDIATE", color: "bg-purple-100 text-purple-800" };
  return { label: "BEGINNER", color: "bg-blue-100 text-blue-800" };
};

export const calculateYearsOfExperience = (months) => {
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years ${remainingMonths} months`;
};