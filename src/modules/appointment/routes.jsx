import { Route } from "react-router-dom";
import AppointmentList from "./pages/AppointmentList";
import AppointmentEdit from "./pages/AppointmentDetail";
import AppointmentCreate from "./pages/AppointmentCreate";

const AppointmentRoutes = (
  <>
    <Route path="/agendamentos" element={<AppointmentList />} />
    <Route path="/agendamentos/novo" element={<AppointmentCreate />} />
    <Route path="/agendamentos/:id" element={<AppointmentEdit />} />
  </>
);

export default AppointmentRoutes;
