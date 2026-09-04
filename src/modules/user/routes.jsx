import { lazy } from "react"
import { Route } from "react-router-dom"

const UserList = lazy(() => import("./pages/UserList"))
const UserCreate = lazy(() => import("./pages/UserCreate"))
const UserDetail = lazy(() => import("./pages/UserDetail"))

const UserRoutes = (
  <>
    <Route path="/usuarios" element={<UserList />} />
    <Route path="/usuarios/novo" element={<UserCreate />} />
    <Route path="/usuarios/:id" element={<UserDetail />} />
  </>
)

export default UserRoutes
