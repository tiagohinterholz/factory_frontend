// Único lugar que conhece as chaves de sessão no localStorage.
// Quem precisa de token/usuário passa por aqui — nada de localStorage.getItem("access") espalhado.
//
// O `refresh` NÃO fica aqui: ele vive num cookie HttpOnly setado pelo backend
// e o navegador o anexa sozinho nas rotas de /usuarios/. JS nunca o vê.

const ACCESS = "access"
const USER = "user"

export const authStorage = {
  getAccess() {
    return localStorage.getItem(ACCESS)
  },

  getUser() {
    try {
      const raw = localStorage.getItem(USER)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  setSession({ access, user }) {
    if (access !== undefined) localStorage.setItem(ACCESS, access)
    if (user !== undefined) localStorage.setItem(USER, JSON.stringify(user))
  },

  setAccess(access) {
    localStorage.setItem(ACCESS, access)
  },

  clear() {
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(USER)
  },
}
