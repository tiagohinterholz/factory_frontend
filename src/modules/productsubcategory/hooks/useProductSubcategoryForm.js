import { useLocation } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ProductSubcategoryService } from "@/modules/productsubcategory/services/productsubcategory"
import {
  productSubcategorySchema,
  productSubcategoryDefaults,
  productSubcategoryKeys,
} from "../domain"

export function useProductSubcategoryForm() {
  const location = useLocation()
  const preselectedCategory = location.state?.categoryId

  return useResourceForm({
    schema: productSubcategorySchema,
    defaultValues: {
      ...productSubcategoryDefaults,
      category_id: preselectedCategory ? String(preselectedCategory) : "",
    },
    submit: (values) => ProductSubcategoryService.createProductSubcategory(values),
    redirectTo: "/subcategorias-produto",
    invalidate: [productSubcategoryKeys.all],
    errorFallback: "Erro ao criar subcategoria",
  })
}
