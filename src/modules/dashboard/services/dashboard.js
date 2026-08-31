import { api } from "@/api/http"

export const DashboardService = {
  async getDashboard() {
    const response = await api.get("/dashboard/")
    return response.data
  },
}
