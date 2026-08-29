import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
if (!API_URL) {
  throw new Error("VITE_API_URL não definida. Copie .env.example para .env")
}

export const api = axios.create({
    baseURL: API_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
})

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config

        if (error.response?.status !== 401) {
            return Promise.reject(error)
        }
        if (originalRequest._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true

        try {
            const refresh = localStorage.getItem('refresh')
            const response = await axios.post(`${API_URL}/usuarios/refresh-token/`, {
                refresh: refresh,
            })
            const newAccess = response.data.access
            localStorage.setItem("access", newAccess)
            originalRequest.headers["Authorization"] = `Bearer ${newAccess}`
            
            return api(originalRequest)
        } catch (refreshError) {
            localStorage.clear();
            window.location.href = "/";
            return Promise.reject(refreshError);
        }
    }   

)
