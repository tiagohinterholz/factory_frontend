import { api } from "@/api/http"

export async function getDashboard() {
    const response = await api.get('/dashboard/')
    return response.data
}