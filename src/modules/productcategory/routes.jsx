import { lazy } from "react"
import { Route } from "react-router-dom"

const ProductCategoryList = lazy(() => import("./pages/ProductCategoryList"))
const ProductCategoryCreate = lazy(() => import("./pages/ProductCategoryCreate"))
const ProductCategoryEdit = lazy(() => import("./pages/ProductCategoryEdit"))

const ProductCategoryRoutes = (
  <>
    <Route path="/categorias-produto" element={<ProductCategoryList />} />
    <Route path="/categorias-produto/novo" element={<ProductCategoryCreate />} />
    <Route path="/categorias-produto/:id" element={<ProductCategoryEdit />} />
  </>
)

export default ProductCategoryRoutes
