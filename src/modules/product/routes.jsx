import { lazy } from "react"
import { Route } from "react-router-dom"

const ProductList = lazy(() => import("./pages/ProductList"))
const ProductCreate = lazy(() => import("./pages/ProductCreate"))
const ProductDetail = lazy(() => import("./pages/ProductDetail"))

const ProductRoutes = (
  <>
    <Route path="/produtos" element={<ProductList />} />
    <Route path="/produtos/novo" element={<ProductCreate />} />
    <Route path="/produtos/:id" element={<ProductDetail />} />
  </>
)

export default ProductRoutes
