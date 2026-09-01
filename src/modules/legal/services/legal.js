import { api } from "@/api/http"

export const LegalService = {
  // GET /privacidade/ — público, retorna { content: "<markdown>" }
  async getPrivacyPolicy() {
    const { data } = await api.get("/privacidade/")
    return data
  },
}
