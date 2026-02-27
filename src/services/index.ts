import axios from "axios";
export const getBaseUrl = (): string => {
  const mode = process.env.NEXT_PUBLIC_DEVELOPMENT_MODE?.toLowerCase();

  let baseUrl: any ;

  if (mode === "test") {
    baseUrl = process.env.NEXT_PUBLIC_API_URL_TEST;
  } 
  else if (mode === "staging") {
    baseUrl = process.env.NEXT_PUBLIC_API_URL_STAGING;
  } 
  else if (mode === "prod") {
    baseUrl = process.env.NEXT_PUBLIC_API_URL_PROD;
  } 
  else {
    // Default fallback
    baseUrl = process.env.NEXT_PUBLIC_API_URL_PROD;
  }

  if (!baseUrl) {
    console.log("Base URL is not defined in environment variables.");
  }  
  console.log("Axios Base URL:", baseUrl);

  return baseUrl;
};
const BASE_URL= getBaseUrl();
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
