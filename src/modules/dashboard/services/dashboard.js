import { api } from "@/api/http"

// Formato da resposta documentado em docs/dashboard-contract.md.
export const DashboardService = {
  async getDashboard() {
    const response = await api.get("/dashboard/")
    return response.data
  },
}
