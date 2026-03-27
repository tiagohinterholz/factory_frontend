import { BrowserRouter, Routes, Route } from "react-router-dom"
import PrivateRoute from "@/routes/PrivateRoute"
import DashboardLayout from "@/modules/core/layout/DashboardLayout"

import AuthRoutes from "@/modules/auth/routes"
import DashboardRoutes from "@/modules/dashboard/routes"
import BusinessRoutes from "@/modules/business/routes"
import LocationRoutes from "@/modules/location/routes"
import SupplierRoutes from "@/modules/supplier/routes"
import ClientRoutes from "@/modules/client/routes"
import VehicleRoutes from "@/modules/vehicle/routes"
import ProductRoutes from "@/modules/product/routes"
import WorkServiceRoutes from "@/modules/workservice/routes"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes (Public) */}
        {AuthRoutes}

        {/* Dashboard routes (Private & Layout wrapped) */}
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          {DashboardRoutes}
          {BusinessRoutes}
          {LocationRoutes}
          {SupplierRoutes}
          {ClientRoutes}
          {VehicleRoutes}
          {ProductRoutes}
          {WorkServiceRoutes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
