import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { ClientService } from "@/modules/client/services/client"
import { clientSchema, clientDefaults, toClientPayload, clientKeys } from "../domain"
import { vehicleKeys } from "@/modules/vehicle/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

// dto da API -> shape do form (ids como string)
function toClientForm(data) {
  return {
    business_id: idOf(data.business),
    first_name: data.first_name ?? "",
    last_name: data.last_name ?? "",
    cpf: data.cpf ?? "",
    state_id: idOf(data.state),
    city_id: idOf(data.city),
    address: data.address ?? "",
    number: data.number ?? "",
    complement: data.complement ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
  }
}

export function useClientEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: clientSchema,
    defaultValues: clientDefaults,
    load: async () => toClientForm(await ClientService.getClientById(id)),
    submit: (values) => ClientService.updateClient(id, toClientPayload(values)),
    redirectTo: "/clientes",
    invalidate: [clientKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar cliente",
  })

  const remove = useResourceAction({
    mutationFn: () => ClientService.deleteClient(id),
    confirm: {
      title: "Excluir cliente?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [clientKeys.all, vehicleKeys.all, dashboardKeys.all],
    onSuccess: () => navigate("/clientes"),
    errorFallback: "Erro ao excluir cliente",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
