import { api } from "@/api/http"

export class DashboardService {
  static async getDashboard() {
      const response = await api.get('/dashboard/')
      return response.data
  }
}