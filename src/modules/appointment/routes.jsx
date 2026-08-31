import { lazy } from "react"
import { Route } from "react-router-dom"

const AppointmentList = lazy(() => import("./pages/AppointmentList"))
const AppointmentCreate = lazy(() => import("./pages/AppointmentCreate"))
const AppointmentEdit = lazy(() => import("./pages/AppointmentDetail"))

const AppointmentRoutes = (
  <>
    <Route path="/agendamentos" element={<AppointmentList />} />
    <Route path="/agendamentos/novo" element={<AppointmentCreate />} />
    <Route path="/agendamentos/:id" element={<AppointmentEdit />} />
  </>
)

export default AppointmentRoutes
