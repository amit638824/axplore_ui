import axios from "axios";

// Determine base URL based on environment
const BASE_URL =
  process.env.NEXT_PUBLIC_DEVELOPMENT_MODE =="test"
    ? "http://localhost:4000"
    : "https://axplore-dev.alphadroid.dev";
 
console.log(process.env.NEXT_PUBLIC_DEVELOPMENT_MODE,"Axios Base URL:", BASE_URL);

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
