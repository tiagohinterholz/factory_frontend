import { createContext, useContext } from "react"

export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth precisa estar dentro de <AuthProvider>")
  }
  return {
    user: context.user,
    loading: context.loading,
    login: context.login,
    logout: context.logout,
    isAuthenticated: !!context.user,
    isSuperUser: !!context.user && !context.user.business_id,
    businessId: context.user?.business_id ?? null,
  }
}
