import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { SERVER_URL } from "@/constants";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach access token to all requests
api.interceptors.request.use(async (config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
