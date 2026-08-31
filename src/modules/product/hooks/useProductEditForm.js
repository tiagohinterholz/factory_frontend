import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ProductService } from "@/modules/product/services/product"
import { productSchema, productDefaults } from "../product.schema"

function toProductForm(data) {
  const idOf = (value) => String(value?.id ?? value ?? "")
  return {
    business_id: idOf(data.business),
    supplier_id: idOf(data.supplier),
    name: data.name ?? "",
    brand: data.brand ?? "",
    reference: data.reference ?? "",
    description: data.description ?? "",
    stock_quantity: data.stock_quantity ?? "",
    unit_price: data.unit_price ?? "",
  }
}

export function useProductEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()

  const { form, onSubmit, loading } = useResourceForm({
    schema: productSchema,
    defaultValues: productDefaults,
    load: async () => toProductForm(await ProductService.getProductById(id)),
    submit: (values) => ProductService.updateProduct(id, values),
    redirectTo: "/produtos",
    errorFallback: "Erro ao atualizar produto",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir produto?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await ProductService.deleteProduct(id)
    navigate("/produtos")
  }

  return { form, onSubmit, loading, handleDelete }
}
