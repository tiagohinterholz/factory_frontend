import { lazy } from "react"
import { Route } from "react-router-dom"

const VehicleList = lazy(() => import("./pages/VehicleList"))
const VehicleCreate = lazy(() => import("./pages/VehicleCreate"))
const VehicleEdit = lazy(() => import("./pages/VehicleDetail"))

const VehicleRoutes = (
  <>
    <Route path="/veiculos" element={<VehicleList />} />
    <Route path="/veiculos/novo" element={<VehicleCreate />} />
    <Route path="/veiculos/:id" element={<VehicleEdit />} />
  </>
)

export default VehicleRoutes
