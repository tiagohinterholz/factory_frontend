import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { supplierSchema, supplierDefaults } from "../supplier.schema"

// dto da API -> shape do form (ids como string)
function toSupplierForm(data) {
  const idOf = (value) => String(value?.id ?? value ?? "")
  return {
    business_id: idOf(data.business),
    corporate_name: data.corporate_name ?? "",
    trade_name: data.trade_name ?? "",
    cnpj: data.cnpj ?? "",
    state_id: idOf(data.state),
    city_id: idOf(data.city),
    address: data.address ?? "",
    number: data.number ?? "",
    complement: data.complement ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
  }
}

export function useSupplierEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()

  const { form, onSubmit, loading } = useResourceForm({
    schema: supplierSchema,
    defaultValues: supplierDefaults,
    load: async () => toSupplierForm(await SupplierService.getSupplierById(id)),
    submit: (values) => SupplierService.updateSupplier(id, values),
    redirectTo: "/fornecedores",
    errorFallback: "Erro ao atualizar fornecedor",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir fornecedor?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await SupplierService.deleteSupplier(id)
    navigate("/fornecedores")
  }

  return { form, onSubmit, loading, handleDelete }
}
