import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { authStorage } from "@/api/auth-storage"
import { isExpired } from "@/api/jwt"

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()

  // Só devolve para o login quando NÃO há como recuperar a sessão: access e
  // refresh ambos vencidos/ausentes. Se só o access expirou, deixamos renderizar
  // e o interceptor do http.js faz o refresh no primeiro 401.
  const sessionDead = isExpired(authStorage.getAccess()) && isExpired(authStorage.getRefresh())

  if (!isAuthenticated || sessionDead) {
    return <Navigate to="/" replace />
  }

  return children || <Outlet />
}
