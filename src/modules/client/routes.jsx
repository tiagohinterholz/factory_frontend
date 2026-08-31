import { lazy } from "react"
import { Route } from "react-router-dom"

const ClientList = lazy(() => import("./pages/ClientList"))
const ClientCreate = lazy(() => import("./pages/ClientCreate"))
const ClientEdit = lazy(() => import("./pages/ClientDetail"))

const ClientRoutes = (
  <>
    <Route path="/clientes" element={<ClientList />} />
    <Route path="/clientes/novo" element={<ClientCreate />} />
    <Route path="/clientes/:id" element={<ClientEdit />} />
  </>
)

export default ClientRoutes
