import { lazy } from "react"
import { Route } from "react-router-dom"

const FinancialCategoryList = lazy(() => import("./pages/FinancialCategoryList"))
const FinancialCategoryCreate = lazy(() => import("./pages/FinancialCategoryCreate"))
const FinancialCategoryEdit = lazy(() => import("./pages/FinancialCategoryEdit"))
const FinancialTagList = lazy(() => import("./pages/FinancialTagList"))

const FinancialCategoryRoutes = (
  <>
    <Route path="/financeiro/categorias" element={<FinancialCategoryList />} />
    <Route path="/financeiro/categorias/novo" element={<FinancialCategoryCreate />} />
    <Route path="/financeiro/categorias/:id" element={<FinancialCategoryEdit />} />
    <Route path="/financeiro/tags" element={<FinancialTagList />} />
  </>
)

export default FinancialCategoryRoutes
