import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { base64ImageDataUri } from "@/api/media"
import { BusinessService } from "@/modules/business/services/business"
import { businessSchema, businessDefaults, toBusinessPayload, businessKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

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
    // o back manda `logo` como base64 cru; `logo_url` é o fallback (URL pronta)
    logo: data.logo ? base64ImageDataUri(data.logo) : (data.logo_url ?? ""),
  }
}

export function useBusinessEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: businessSchema,
    defaultValues: businessDefaults,
    load: async () => toBusinessForm(await BusinessService.getBusinessById(id)),
    submit: (values) => BusinessService.updateBusiness(id, toBusinessPayload(values)),
    redirectTo: "/empreendimentos",
    invalidate: [businessKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar empreendimento",
  })

  const remove = useResourceAction({
    mutationFn: () => BusinessService.deleteBusiness(id),
    confirm: {
      title: "Excluir empreendimento?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [businessKeys.all, dashboardKeys.all],
    onSuccess: () => navigate("/empreendimentos"),
    errorFallback: "Erro ao excluir empreendimento",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
