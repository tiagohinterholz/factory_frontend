import { Route } from "react-router-dom"
import OrderList from "./pages/OrderList"
import OrderCreate from "./pages/OrderCreate"
import OrderEdit from "./pages/OrderEdit"

const OrderRoutes = [
  <Route key="order-list" path="/ordens" element={<OrderList />} />,
  <Route key="order-create" path="/ordens/novo" element={<OrderCreate />} />,
  <Route key="order-edit" path="/ordens/:id" element={<OrderEdit />} />,
]

export default OrderRoutes
