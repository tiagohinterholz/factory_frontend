import { lazy } from "react"
import { Route } from "react-router-dom"

const LicenseList = lazy(() => import("./pages/LicenseList"))
const LicenseCreate = lazy(() => import("./pages/LicenseCreate"))
const LicenseDetail = lazy(() => import("./pages/LicenseDetail"))

const LicenseRoutes = (
  <>
    <Route path="/empreendimentos/licencas" element={<LicenseList />} />
    <Route path="/empreendimentos/licencas/novo" element={<LicenseCreate />} />
    <Route path="/empreendimentos/licencas/:id" element={<LicenseDetail />} />
  </>
)

export default LicenseRoutes
