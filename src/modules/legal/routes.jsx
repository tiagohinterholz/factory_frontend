import { lazy } from "react"
import { Route } from "react-router-dom"

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"))

const LegalRoutes = <Route path="/privacidade" element={<PrivacyPolicy />} />

export default LegalRoutes
