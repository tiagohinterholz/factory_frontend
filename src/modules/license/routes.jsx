import { Route } from "react-router-dom";
import LicenseCreate from "./pages/LicenseCreate";
import LicenseDetail from "./pages/LicenseDetail";
import LicenseList from "./pages/LicenseList";

const LicenseRoutes = (
  <>
    <Route path="/empreendimentos/licencas" element={<LicenseList />} />
    <Route path="/empreendimentos/licencas/novo" element={<LicenseCreate />} />
    <Route path="/empreendimentos/licencas/:id" element={<LicenseDetail />} />
  </>
);

export default LicenseRoutes;
