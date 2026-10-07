import { api } from "@/api/http"

export const BusinessService = {
  // Lista completa — usada só pro <select> de "escolher empreendimento" do
  // superusuário em outros módulos (Cliente, Veículo, OS...). Não tem mais
  // tela própria de listagem/cadastro de empreendimento no site.
  async getBusiness(params = {}) {
    const response = await api.get("/empreendimentos/", { params })
    return response.data
  },

  // Empreendimento do usuário logado — sem ID na URL, o back resolve pelo
  // token. Superusuário (sem negócio vinculado) recebe 400 nesses endpoints.
  async getSelf() {
    const response = await api.get("/configuracoes/")
    return response.data
  },

  async updateSelf(payload) {
    const response = await api.patch("/configuracoes/", payload)
    return response.data
  },

  // Binário da imagem (Content-Type: image/png), não JSON — precisa de
  // responseType "blob" e vira um object URL pra usar em <img src>. 404 sem
  // logo cadastrado.
  async getSelfLogo() {
    const response = await api.get("/configuracoes/logo/", { responseType: "blob" })
    return response.data
  },

  // Horário de funcionamento do próprio negócio (0=segunda ... 6=domingo).
  // GET libera pra superuser/admin/atendente; PATCH só superuser/admin.
  async getSelfHours() {
    const response = await api.get("/configuracoes/horarios/")
    return response.data
  },

  async updateSelfHour(weekday, payload) {
    const response = await api.patch(`/configuracoes/horarios/${weekday}/`, payload)
    return response.data
  },
}
