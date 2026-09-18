import { lazy } from "react"
import { Route } from "react-router-dom"

const ProductSubcategoryList = lazy(() => import("./pages/ProductSubcategoryList"))
const ProductSubcategoryCreate = lazy(() => import("./pages/ProductSubcategoryCreate"))
const ProductSubcategoryEdit = lazy(() => import("./pages/ProductSubcategoryEdit"))

const ProductSubcategoryRoutes = (
  <>
    <Route path="/subcategorias-produto" element={<ProductSubcategoryList />} />
    <Route path="/subcategorias-produto/novo" element={<ProductSubcategoryCreate />} />
    <Route path="/subcategorias-produto/:id" element={<ProductSubcategoryEdit />} />
  </>
)

export default ProductSubcategoryRoutes
