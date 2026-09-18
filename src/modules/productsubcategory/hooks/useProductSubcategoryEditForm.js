import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { ProductSubcategoryService } from "@/modules/productsubcategory/services/productsubcategory"
import {
  productSubcategorySchema,
  productSubcategoryDefaults,
  productSubcategoryKeys,
} from "../domain"

export function useProductSubcategoryEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: productSubcategorySchema,
    defaultValues: productSubcategoryDefaults,
    load: async () => {
      const data = await ProductSubcategoryService.getProductSubcategory(id)
      return { name: data.name ?? "", category_id: idOf(data.category) }
    },
    submit: (values) => ProductSubcategoryService.updateProductSubcategory(id, values),
    redirectTo: "/subcategorias-produto",
    invalidate: [productSubcategoryKeys.all],
    errorFallback: "Erro ao atualizar subcategoria",
  })

  const remove = useResourceAction({
    mutationFn: () => ProductSubcategoryService.deleteProductSubcategory(id),
    confirm: {
      title: "Excluir subcategoria?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [productSubcategoryKeys.all],
    onSuccess: () => navigate("/subcategorias-produto"),
    errorFallback: "Erro ao excluir subcategoria",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
