import { Route } from "react-router-dom";
import UserList from "./pages/UserList";
import UserCreate from "./pages/UserCreate";

const UserRoutes = (
  <>
    <Route path="/usuarios" element={<UserList />} />
    <Route path="/usuarios/novo" element={<UserCreate />} />
  </>
);

export default UserRoutes;
