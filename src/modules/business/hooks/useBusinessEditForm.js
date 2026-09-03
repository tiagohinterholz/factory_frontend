import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf } from "@/api/dto"
import { BusinessService } from "@/modules/business/services/business"
import { businessSchema, businessDefaults } from "../business.schema"

function toBusinessForm(data) {
  return {
    corporate_name: data.corporate_name ?? "",
    trade_name: data.trade_name ?? "",
    cnpj: data.cnpj ?? "",
    state_registration: data.state_registration ?? "",
    municipal_registration: data.municipal_registration ?? "",
    tax_regime: data.tax_regime || "simples_nacional",
    state_id: idOf(data.state),
    city_id: idOf(data.city),
    address: data.address ?? "",
    number: data.number ?? "",
    complement: data.complement ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
  }
}

export function useBusinessEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const queryClient = useQueryClient()

  const { form, onSubmit, loading } = useResourceForm({
    schema: businessSchema,
    defaultValues: businessDefaults,
    load: async () => toBusinessForm(await BusinessService.getBusinessById(id)),
    submit: (values) => BusinessService.updateBusiness(id, values),
    redirectTo: "/empreendimentos",
    errorFallback: "Erro ao atualizar empreendimento",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir empreendimento?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await BusinessService.deleteBusiness(id)
    queryClient.invalidateQueries()
    navigate("/empreendimentos")
  }

  return { form, onSubmit, loading, handleDelete }
}
