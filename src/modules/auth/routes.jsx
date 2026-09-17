import { Route } from "react-router-dom"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

const AuthRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/esqueci-senha" element={<ForgotPassword />} />
    {/* path em inglês de propósito: bate com o link que o backend já monta
        em email_service.send_password_reset (settings.FRONTEND_URL +
        "/reset-password/<uidb64>/<token>"), não é escolha minha aqui. */}
    <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
  </>
)

export default AuthRoutes
