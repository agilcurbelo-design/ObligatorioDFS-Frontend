import axios from "axios";

export const getApiErrorMessage = (error, fallback) => {
  const serverMessage = error.response?.data?.message || error.response?.data?.error;
  if (serverMessage) return serverMessage;
  if (error.request) {
    return "No se pudo conectar con la API. Verificá la conexión y la URL configurada.";
  }
  return error.message || fallback;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://obligatorio-dfs-332896.vercel.app/api/v1",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      window.dispatchEvent(new Event("session-expired"));
    }
    return Promise.reject(error);
  },
);

export default api;
