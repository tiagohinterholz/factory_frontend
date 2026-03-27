import { Route } from "react-router-dom";
import ClientList from "./pages/ClientList";
import ClientEdit from "./pages/ClientDetail";
import ClientCreate from "./pages/ClientCreate";

const ClientRoutes = (
  <>
    <Route path="/clientes" element={<ClientList />} />
    <Route path="/clientes/novo" element={<ClientCreate />} />
    <Route path="/clientes/:id" element={<ClientEdit />} />
  </>
);

export default ClientRoutes;
