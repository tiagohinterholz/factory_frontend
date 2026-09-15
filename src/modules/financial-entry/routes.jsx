import { lazy } from "react"
import { Route } from "react-router-dom"

const FinancialEntryList = lazy(() => import("./pages/FinancialEntryList"))
const FinancialEntryCreate = lazy(() => import("./pages/FinancialEntryCreate"))
const FinancialEntryEdit = lazy(() => import("./pages/FinancialEntryEdit"))

const FinancialEntryRoutes = [
  <Route key="financial-entry-list" path="/financeiro" element={<FinancialEntryList />} />,
  <Route key="financial-entry-create" path="/financeiro/novo" element={<FinancialEntryCreate />} />,
  <Route key="financial-entry-edit" path="/financeiro/:id" element={<FinancialEntryEdit />} />,
]

export default FinancialEntryRoutes
