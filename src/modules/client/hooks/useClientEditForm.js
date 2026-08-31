import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ClientService } from "@/modules/client/services/client"
import { clientSchema, clientDefaults, toClientPayload } from "../client.schema"

// dto da API -> shape do form (ids como string)
function toClientForm(data) {
  const idOf = (value) => String(value?.id ?? value ?? "")
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
  const confirm = useConfirm()

  const { form, onSubmit, loading } = useResourceForm({
    schema: clientSchema,
    defaultValues: clientDefaults,
    load: async () => toClientForm(await ClientService.getClientById(id)),
    submit: (values) => ClientService.updateClient(id, toClientPayload(values)),
    redirectTo: "/clientes",
    errorFallback: "Erro ao atualizar cliente",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir cliente?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await ClientService.deleteClient(id)
    navigate("/clientes")
  }

  return { form, onSubmit, loading, handleDelete }
}
