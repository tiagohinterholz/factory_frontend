import { lazy } from "react"
import { Route } from "react-router-dom"

const UserList = lazy(() => import("./pages/UserList"))
const UserCreate = lazy(() => import("./pages/UserCreate"))

const UserRoutes = (
  <>
    <Route path="/usuarios" element={<UserList />} />
    <Route path="/usuarios/novo" element={<UserCreate />} />
  </>
)

export default UserRoutes
