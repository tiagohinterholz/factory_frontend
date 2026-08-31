import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { WorkServiceService } from "@/modules/workservice/services/workservice"
import { serviceSchema, serviceDefaults } from "../service.schema"

function toServiceForm(data) {
  const idOf = (value) => String(value?.id ?? value ?? "")
  return {
    business_id: idOf(data.business),
    supplier_id: idOf(data.supplier),
    name: data.name ?? "",
    description: data.description ?? "",
    unit_price: data.unit_price ?? "",
  }
}

export function useWorkServiceEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()

  const { form, onSubmit, loading } = useResourceForm({
    schema: serviceSchema,
    defaultValues: serviceDefaults,
    load: async () => toServiceForm(await WorkServiceService.getWorkServiceById(id)),
    submit: (values) => WorkServiceService.updateWorkService(id, values),
    redirectTo: "/servicos",
    errorFallback: "Erro ao atualizar serviço",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir serviço?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await WorkServiceService.deleteWorkService(id)
    navigate("/servicos")
  }

  return { form, onSubmit, loading, handleDelete }
}
