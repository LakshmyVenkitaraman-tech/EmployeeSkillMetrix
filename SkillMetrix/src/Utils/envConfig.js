
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://insights-api.terrificminds.com",
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  LOG_API_REQUESTS: import.meta.env.VITE_LOG_API_REQUESTS === 'true'
};


export const USER_CONFIG = {
  DEFAULT_USER_ID: import.meta.env.VITE_USER_ID || "60041175820"
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


  const fromStorage = typeof window !== "undefined" && 
    (localStorage.getItem("user_id") || localStorage.getItem("USER_ID"));
  if (fromStorage) return fromStorage;


  return USER_CONFIG.DEFAULT_USER_ID;
};

export const getApiBaseUrl = () => API_CONFIG.BASE_URL;

export const isDebugMode = () => API_CONFIG.DEBUG_MODE;


export const shouldLogApiRequests = () => API_CONFIG.LOG_API_REQUESTS;


export const getEnvConfig = () => ({
  api: API_CONFIG,
  user: USER_CONFIG,
  userId: getResolvedUserId()
});