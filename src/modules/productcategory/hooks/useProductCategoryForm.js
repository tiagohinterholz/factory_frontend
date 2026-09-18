import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ProductCategoryService } from "@/modules/productcategory/services/productcategory"
import { productCategorySchema, productCategoryDefaults, productCategoryKeys } from "../domain"

export function useProductCategoryForm() {
  return useResourceForm({
    schema: productCategorySchema,
    defaultValues: productCategoryDefaults,
    submit: (values) => ProductCategoryService.createProductCategory(values),
    redirectTo: "/categorias-produto",
    invalidate: [productCategoryKeys.all],
    errorFallback: "Erro ao criar categoria",
  })
}
