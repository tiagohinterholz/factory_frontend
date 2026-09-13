import { lazy } from "react"
import { Route } from "react-router-dom"

const VehicleModelList = lazy(() => import("./pages/VehicleModelList"))
const VehicleModelCreate = lazy(() => import("./pages/VehicleModelCreate"))
const VehicleModelEdit = lazy(() => import("./pages/VehicleModelEdit"))

const VehicleModelRoutes = (
  <>
    <Route path="/modelos" element={<VehicleModelList />} />
    <Route path="/modelos/novo" element={<VehicleModelCreate />} />
    <Route path="/modelos/:id" element={<VehicleModelEdit />} />
  </>
)

export default VehicleModelRoutes
