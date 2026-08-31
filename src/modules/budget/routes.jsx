import { lazy } from "react"
import { Route } from "react-router-dom"

const BudgetList = lazy(() => import("./pages/BudgetList"))
const BudgetCreate = lazy(() => import("./pages/BudgetCreate"))
const BudgetEdit = lazy(() => import("./pages/BudgetEdit"))

const BudgetRoutes = [
  <Route key="budget-list" path="/orcamentos" element={<BudgetList />} />,
  <Route key="budget-create" path="/orcamentos/novo" element={<BudgetCreate />} />,
  <Route key="budget-edit" path="/orcamentos/:id" element={<BudgetEdit />} />,
]

export default BudgetRoutes
