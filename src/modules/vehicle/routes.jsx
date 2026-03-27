import { Route } from "react-router-dom";
import VehicleList from "./pages/VehicleList";
import VehicleEdit from "./pages/VehicleDetail";
import VehicleCreate from "./pages/VehicleCreate";

const VehicleRoutes = (
  <>
    <Route path="/veiculos" element={<VehicleList />} />
    <Route path="/veiculos/novo" element={<VehicleCreate />} />
    <Route path="/veiculos/:id" element={<VehicleEdit />} />
  </>
);

export default VehicleRoutes;
