import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { ProductCategoryService } from "@/modules/productcategory/services/productcategory"
import { productCategorySchema, productCategoryDefaults, productCategoryKeys } from "../domain"

export function useProductCategoryEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: productCategorySchema,
    defaultValues: productCategoryDefaults,
    load: async () => {
      const data = await ProductCategoryService.getProductCategory(id)
      return { name: data.name ?? "", is_active: data.is_active ?? true }
    },
    submit: (values) => ProductCategoryService.updateProductCategory(id, values),
    redirectTo: "/categorias-produto",
    invalidate: [productCategoryKeys.all],
    errorFallback: "Erro ao atualizar categoria",
  })

  const remove = useResourceAction({
    mutationFn: () => ProductCategoryService.deleteProductCategory(id),
    confirm: {
      title: "Excluir categoria?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [productCategoryKeys.all],
    onSuccess: () => navigate("/categorias-produto"),
    errorFallback: "Erro ao excluir categoria",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
