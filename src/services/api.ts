import axios from "axios";

export const TOKEN_STORAGE_KEY = "@yggdraflow:token";
export const USER_STORAGE_KEY = "@yggdraflow:user";

function getAuthToken() {
  return (
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    localStorage.getItem("yggdraflow_token") ||
    localStorage.getItem("token")
  );
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem("yggdraflow_token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333",
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
