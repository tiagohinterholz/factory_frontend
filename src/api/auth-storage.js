// Único lugar que conhece as chaves de sessão no localStorage.
// Quem precisa de token/usuário passa por aqui — nada de localStorage.getItem("access") espalhado.

const ACCESS = "access"
const REFRESH = "refresh"
const USER = "user"

export const authStorage = {
  getAccess() {
    return localStorage.getItem(ACCESS)
  },

  getRefresh() {
    return localStorage.getItem(REFRESH)
  },

  getUser() {
    try {
      const raw = localStorage.getItem(USER)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  setSession({ access, refresh, user }) {
    if (access !== undefined) localStorage.setItem(ACCESS, access)
    if (refresh !== undefined) localStorage.setItem(REFRESH, refresh)
    if (user !== undefined) localStorage.setItem(USER, JSON.stringify(user))
  },

  setAccess(access) {
    localStorage.setItem(ACCESS, access)
  },

  clear() {
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(REFRESH)
    localStorage.removeItem(USER)
  },
}
