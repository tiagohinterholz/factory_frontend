import { Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

const DashboardRoutes = (
  <Route path="/dashboard" element={<Dashboard />} />
);

export default DashboardRoutes;
