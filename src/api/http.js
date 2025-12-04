import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://localhost:8000'
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
            const response = await axios.post('http://localhost:8000/usuarios/refresh-token/', {
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
