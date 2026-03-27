import { Route } from "react-router-dom";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import ProductCreate from "./pages/ProductCreate";

const ProductRoutes = (
  <>
    <Route path="/produtos" element={<ProductList />} />
    <Route path="/produtos/novo" element={<ProductCreate />} />
    <Route path="/produtos/:id" element={<ProductDetail />} />
  </>
);

export default ProductRoutes;
