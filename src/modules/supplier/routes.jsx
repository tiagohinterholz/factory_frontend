import { lazy } from "react"
import { Route } from "react-router-dom"

const SupplierList = lazy(() => import("./pages/SupplierList"))
const SupplierCreate = lazy(() => import("./pages/SupplierCreate"))
const SupplierEdit = lazy(() => import("./pages/SupplierDetail"))

const SupplierRoutes = (
  <>
    <Route path="/fornecedores" element={<SupplierList />} />
    <Route path="/fornecedores/novo" element={<SupplierCreate />} />
    <Route path="/fornecedores/:id" element={<SupplierEdit />} />
  </>
)

export default SupplierRoutes
