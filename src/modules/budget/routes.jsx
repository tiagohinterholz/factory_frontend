import { Route } from "react-router-dom"
import BudgetList from "./pages/BudgetList"
import BudgetCreate from "./pages/BudgetCreate"
import BudgetEdit from "./pages/BudgetEdit"

const BudgetRoutes = [
  <Route key="budget-list" path="/orcamentos" element={<BudgetList />} />,
  <Route key="budget-create" path="/orcamentos/novo" element={<BudgetCreate />} />,
  <Route key="budget-edit" path="/orcamentos/:id" element={<BudgetEdit />} />,
]

export default BudgetRoutes
