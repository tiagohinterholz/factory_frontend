import { lazy } from "react"
import { Route } from "react-router-dom"

const SignupCheckout = lazy(() => import("./pages/SignupCheckout"))
const SignupPayment = lazy(() => import("./pages/SignupPayment"))
const ActivateAccount = lazy(() => import("./pages/ActivateAccount"))

const SignupRoutes = (
  <>
    <Route path="/assinar/:period" element={<SignupCheckout />} />
    <Route path="/assinar/:id/pagamento" element={<SignupPayment />} />
    <Route path="/ativar-conta/:uidb64/:token" element={<ActivateAccount />} />
  </>
)

export default SignupRoutes
