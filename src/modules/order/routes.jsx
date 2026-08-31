import { lazy } from "react"
import { Route } from "react-router-dom"

const OrderList = lazy(() => import("./pages/OrderList"))
const OrderCreate = lazy(() => import("./pages/OrderCreate"))
const OrderEdit = lazy(() => import("./pages/OrderEdit"))

const OrderRoutes = [
  <Route key="order-list" path="/ordens" element={<OrderList />} />,
  <Route key="order-create" path="/ordens/novo" element={<OrderCreate />} />,
  <Route key="order-edit" path="/ordens/:id" element={<OrderEdit />} />,
]

export default OrderRoutes
