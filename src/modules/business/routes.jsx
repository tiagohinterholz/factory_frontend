import { Route } from "react-router-dom";
import BusinessList from "./pages/BusinessList";
import BusinessDetail from "./pages/BusinessDetail";
import BusinessCreate from "./pages/BusinessCreate";

const BusinessRoutes = (
  <>
    <Route path="/empreendimentos" element={<BusinessList />} />
    <Route path="/empreendimentos/novo" element={<BusinessCreate />} />
    <Route path="/empreendimentos/:id" element={<BusinessDetail />} />
  </>
);

export default BusinessRoutes;
