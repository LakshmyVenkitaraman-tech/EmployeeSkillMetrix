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
    const res = await axios.get(`${API_BASE}/v1/user/${userId}/profile`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async getUserEmploymentHistory(userId) {
    const res = await axios.get(`${API_BASE}/v1/user/${userId}/employment-history`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async addEmploymentHistory(userId, historyData) {
    const res = await axios.post(`${API_BASE}/v1/user/${userId}/employment-history`, historyData);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async updateEmploymentHistory(userId, historyId, historyData) {
    const res = await axios.put(`${API_BASE}/v1/user/${userId}/employment-history/${historyId}`, historyData);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async deleteEmploymentHistory(userId, historyId) {
    const res = await axios.delete(`${API_BASE}/v1/user/${userId}/employment-history/${historyId}`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async getUserSkills(userId) {
    const res = await axios.get(`${API_BASE}/v1/user/${userId}/skills`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async addUserSkill(userId, skillData) {
    const payload = {
      skill_id: Number(skillData.skill_id),
      proficiency: Number(skillData.proficiency),
      months_experience: Number(skillData.months_experience),
    };
    const res = await axios.post(`${API_BASE}/v1/user/${userId}/skills`, payload);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async updateUserSkill(userId, skillId, skillData) {
    const payload = {
      skill_id: Number(skillData.skill_id),
      proficiency: Number(skillData.proficiency),
      months_experience: Number(skillData.months_experience),
    };
    const res = await axios.put(`${API_BASE}/v1/user/${userId}/skills/${skillId}`, payload);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async deleteUserSkill(userId, skillId) {
    const res = await axios.delete(`${API_BASE}/v1/user/${userId}/skills/${skillId}`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async getEmploymentTypes() {
    const res = await axios.get(`${API_BASE}/v1/employment-types`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  async getAvailableSkills(query = '') {
    let allSkills = [];
    let page = 1;
    let hasMore = true;
    const limit = 50;

    while (hasMore) {
      try {
        const res = await axios.get(`${API_BASE}/v1/skills?page=${page}&limit=${limit}&q=${query}`);
        const data = res.data?.data;
        const total = res.data?.pagination?.total;

        if (Array.isArray(data) && data.length > 0) {
          allSkills = allSkills.concat(data);
          if (allSkills.length >= total) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        hasMore = false;
        throw error;
      }
    }
    return allSkills;
  },

  async getCountries() {
    const res = await axios.get(`${API_BASE}/v1/countries`);
    return res.data && res.data.data ? res.data.data : res.data;
  }
};

export const getResolvedUserId = () => {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("userId");
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
  if (months === null || months === undefined || months < 0) {
    return "0 months"; 
  }
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
};
