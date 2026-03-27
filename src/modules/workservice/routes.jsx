import { Route } from "react-router-dom";
import WorkServiceList from "./pages/WorkServiceList";
import WorkServiceEdit from "./pages/WorkServiceDetail";
import WorkServiceCreate from "./pages/WorkServiceCreate";

const WorkServiceRoutes = (
  <>
    <Route path="/servicos" element={<WorkServiceList />} />
    <Route path="/servicos/novo" element={<WorkServiceCreate />} />
    <Route path="/servicos/:id" element={<WorkServiceEdit />} />
  </>
);

export default WorkServiceRoutes;
