import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { supplierSchema, supplierDefaults, supplierKeys } from "../domain"
import { productKeys } from "@/modules/product/domain"
import { workServiceKeys } from "@/modules/workservice/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

// dto da API -> shape do form (ids como string)
function toSupplierForm(data) {
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

  const { form, onSubmit, loading } = useResourceForm({
    schema: supplierSchema,
    defaultValues: supplierDefaults,
    load: async () => toSupplierForm(await SupplierService.getSupplierById(id)),
    submit: (values) => SupplierService.updateSupplier(id, values),
    redirectTo: "/fornecedores",
    invalidate: [supplierKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar fornecedor",
  })

  const remove = useResourceAction({
    mutationFn: () => SupplierService.deleteSupplier(id),
    confirm: {
      title: "Excluir fornecedor?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [supplierKeys.all, productKeys.all, workServiceKeys.all, dashboardKeys.all],
    onSuccess: () => navigate("/fornecedores"),
    errorFallback: "Erro ao excluir fornecedor",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
