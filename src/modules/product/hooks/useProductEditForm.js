import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { ProductService } from "@/modules/product/services/product"
import { productSchema, productDefaults, toProductPayload, productKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

function toProductForm(data) {
  return {
    business_id: idOf(data.business),
    supplier_id: idOf(data.supplier),
    category_id: idOf(data.subcategory?.category),
    subcategory_id: idOf(data.subcategory),
    name: data.name ?? "",
    brand: data.brand ?? "",
    reference: data.reference ?? "",
    description: data.description ?? "",
    stock_quantity: data.stock_quantity ?? "",
    unit_price: data.unit_price ?? "",
    cost_price: data.cost_price ?? "",
    unit_of_measure: data.unit_of_measure ?? "UN",
    sku: data.sku ?? "",
    ncm: data.ncm ?? "",
    minimum_stock: data.minimum_stock ?? "",
  }
}

export function useProductEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: productSchema,
    defaultValues: productDefaults,
    load: async () => toProductForm(await ProductService.getProductById(id)),
    submit: (values) => ProductService.updateProduct(id, toProductPayload(values)),
    redirectTo: "/produtos",
    invalidate: [productKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar produto",
  })

  const remove = useResourceAction({
    mutationFn: () => ProductService.deleteProduct(id),
    confirm: {
      title: "Excluir produto?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [productKeys.all, dashboardKeys.all],
    onSuccess: () => navigate("/produtos"),
    errorFallback: "Erro ao excluir produto",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
