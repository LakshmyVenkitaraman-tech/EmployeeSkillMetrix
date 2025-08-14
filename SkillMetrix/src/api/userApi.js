import axios from "axios";

const API_BASE = "https://insights-api.terrificminds.com";

axios.interceptors.request.use(request => {
  console.log('API Request:', request.method && request.method.toUpperCase(), request.url);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response && error.response.status, error.config && error.config.url, error.response && error.response.data);
    return Promise.reject(error);
  }
);

export const api = {
  async getUserProfile(userId) {
    const res = await axios.get(`${API_BASE}/user/${userId}/profile`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async getUserEmploymentHistory(userId) {
    const res = await axios.get(`${API_BASE}/user/${userId}/employment-history`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async addEmploymentHistory(userId, historyData) {
    const res = await axios.post(`${API_BASE}/user/${userId}/employment-history`, historyData);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async updateEmploymentHistory(userId, historyId, historyData) {
    const res = await axios.put(`${API_BASE}/user/${userId}/employment-history/${historyId}`, historyData);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async deleteEmploymentHistory(userId, historyId) {
    const res = await axios.delete(`${API_BASE}/user/${userId}/employment-history/${historyId}`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async getUserSkills(userId) {
    const res = await axios.get(`${API_BASE}/v1/user/${userId}/skills`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async addUserSkill(userId, skillData) {
    const payload = {
      skill_id: skillData.skill_id,
      proficiency: skillData.proficiency ? skillData.proficiency : skillData.rating,
      years_experience: skillData.years_experience ? skillData.years_experience : Math.floor((skillData.months ? skillData.months : (skillData.experience_in_months ? skillData.experience_in_months : 0)) / 12)
    };
    const res = await axios.post(`${API_BASE}/v1/user/${userId}/skills`, payload);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async updateUserSkill(userId, skillId, skillData) {
    const res = await axios.put(`${API_BASE}/v1/user/${userId}/skills/${skillId}`, skillData);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async deleteUserSkill(userId, skillId) {
    const res = await axios.delete(`${API_BASE}/v1/user/${userId}/skills/${skillId}`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async getEmploymentTypes() {
    const res = await axios.get(`${API_BASE}/employment-types`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async getAvailableSkills() {
    try {
      const res = await axios.get(`${API_BASE}/v1/skills`);
      return res.data && res.data.data ? res.data.data : res.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        try {
          const res = await axios.get(`${API_BASE}/skills`);
          return res.data && res.data.data ? res.data.data : res.data;
        } catch (fallbackError) {
          throw error;
        }
      }
      throw error;
    }
  }
};

export const getResolvedUserId = () => {
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get("userId");
    if (fromQuery) {
      localStorage.setItem("user_id", fromQuery);
      return fromQuery;
    }
  } catch (e) {
    console.error("Error parsing URL:", e);
  }

  const fromStorage = typeof window !== "undefined" && (localStorage.getItem("user_id") || localStorage.getItem("USER_ID"));
  if (fromStorage) return fromStorage;

  const fromEnv = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_USER_ID;
  return fromEnv ? fromEnv : 60041175820;
};

export const calculateSkillLevel = (rating) => {
  if (rating >= 7) return { label: "ADVANCED", color: "bg-green-100 text-green-800" };
  if (rating >= 4) return { label: "INTERMEDIATE", color: "bg-purple-100 text-purple-800" };
  return { label: "BEGINNER", color: "bg-blue-100 text-blue-800" };
};

export const calculateYearsOfExperience = (months) => {
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years ${remainingMonths} months`;
};