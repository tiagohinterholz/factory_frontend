import { lazy } from "react"
import { Route } from "react-router-dom"

const ManufacturerList = lazy(() => import("./pages/ManufacturerList"))
const ManufacturerCreate = lazy(() => import("./pages/ManufacturerCreate"))
const ManufacturerEdit = lazy(() => import("./pages/ManufacturerEdit"))

const ManufacturerRoutes = (
  <>
    <Route path="/marcas" element={<ManufacturerList />} />
    <Route path="/marcas/novo" element={<ManufacturerCreate />} />
    <Route path="/marcas/:id" element={<ManufacturerEdit />} />
  </>
)

export default ManufacturerRoutes
