import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children || <Outlet />
}
