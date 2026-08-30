import axios from 'axios'
import { authStorage } from '@/api/auth-storage'

const API_URL = import.meta.env.VITE_API_URL
if (!API_URL) {
  throw new Error("VITE_API_URL não definida. Copie .env.example para .env")
}

export const api = axios.create({
    baseURL: API_URL
})

api.interceptors.request.use((config) => {
  const token = authStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
})

// Single-flight: no máximo um refresh em andamento. Requests que tomam 401
// enquanto ele roda aguardam a MESMA Promise em vez de abrir a sua.
let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/usuarios/refresh-token/`, { refresh: authStorage.getRefresh() })
      .then((response) => {
        const newAccess = response.data.access
        authStorage.setAccess(newAccess)
        return newAccess
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }
        originalRequest._retry = true

        try {
            const newAccess = await refreshAccessToken()
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
            return api(originalRequest)
        } catch (refreshError) {
            authStorage.clear()
            window.location.href = "/"
            return Promise.reject(refreshError)
        }
    }
)
