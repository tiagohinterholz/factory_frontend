import { Route } from "react-router-dom";
import Login from "./pages/Login";

const AuthRoutes = (
  <Route path="/" element={<Login />} />
);

export default AuthRoutes;
