import { lazy } from "react"
import { Route } from "react-router-dom"

const BusinessList = lazy(() => import("./pages/BusinessList"))
const BusinessCreate = lazy(() => import("./pages/BusinessCreate"))
const BusinessDetail = lazy(() => import("./pages/BusinessDetail"))

const BusinessRoutes = (
  <>
    <Route path="/empreendimentos" element={<BusinessList />} />
    <Route path="/empreendimentos/novo" element={<BusinessCreate />} />
    <Route path="/empreendimentos/:id" element={<BusinessDetail />} />
  </>
)

export default BusinessRoutes
