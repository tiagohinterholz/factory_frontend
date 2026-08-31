import { useLocation } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ProductService } from "@/modules/product/services/product"
import { productSchema, productDefaults } from "../product.schema"

export function useProductForm() {
  const location = useLocation()
  const { businessId } = useAuth()

  return useResourceForm({
    schema: productSchema,
    defaultValues: {
      ...productDefaults,
      business_id: businessId ? String(businessId) : "",
      supplier_id: location.state?.supplierId ? String(location.state.supplierId) : "",
    },
    submit: (values) => ProductService.createProduct(values),
    redirectTo: "/produtos",
    errorFallback: "Erro ao criar produto",
  })
}
