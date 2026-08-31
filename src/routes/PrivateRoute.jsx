import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()

  // Com o refresh em cookie HttpOnly não dá pra saber aqui se a sessão é
  // recuperável. Se há usuário, renderiza; um `access` vencido é resolvido
  // pelo interceptor do http.js (refresh via cookie) e, se o cookie também
  // morreu, ele limpa a sessão e redireciona pro login.
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children || <Outlet />
}
