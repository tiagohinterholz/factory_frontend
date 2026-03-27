import { Route } from "react-router-dom";
import SupplierList from "./pages/SupplierList";
import SupplierEdit from "./pages/SupplierDetail";
import SupplierCreate from "./pages/SupplierCreate";

const SupplierRoutes = (
  <>
    <Route path="/fornecedores" element={<SupplierList />} />
    <Route path="/fornecedores/novo" element={<SupplierCreate />} />
    <Route path="/fornecedores/:id" element={<SupplierEdit />} />
  </>
);

export default SupplierRoutes;
