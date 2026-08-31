import { lazy } from "react"
import { Route } from "react-router-dom"

const WorkServiceList = lazy(() => import("./pages/WorkServiceList"))
const WorkServiceCreate = lazy(() => import("./pages/WorkServiceCreate"))
const WorkServiceEdit = lazy(() => import("./pages/WorkServiceDetail"))

const WorkServiceRoutes = (
  <>
    <Route path="/servicos" element={<WorkServiceList />} />
    <Route path="/servicos/novo" element={<WorkServiceCreate />} />
    <Route path="/servicos/:id" element={<WorkServiceEdit />} />
  </>
)

export default WorkServiceRoutes
