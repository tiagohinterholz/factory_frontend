import { lazy } from "react"
import { Route } from "react-router-dom"

const PurchaseOrderList = lazy(() => import("./pages/PurchaseOrderList"))
const PurchaseOrderCreate = lazy(() => import("./pages/PurchaseOrderCreate"))
const PurchaseOrderEdit = lazy(() => import("./pages/PurchaseOrderEdit"))

const PurchaseRoutes = [
  <Route key="purchase-order-list" path="/compras" element={<PurchaseOrderList />} />,
  <Route key="purchase-order-create" path="/compras/novo" element={<PurchaseOrderCreate />} />,
  <Route key="purchase-order-edit" path="/compras/:id" element={<PurchaseOrderEdit />} />,
]

export default PurchaseRoutes
