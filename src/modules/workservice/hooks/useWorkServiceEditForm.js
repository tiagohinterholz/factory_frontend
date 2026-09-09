import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { WorkServiceService } from "@/modules/workservice/services/workservice"
import { serviceSchema, serviceDefaults, workServiceKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

function toServiceForm(data) {
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

  const { form, onSubmit, loading } = useResourceForm({
    schema: serviceSchema,
    defaultValues: serviceDefaults,
    load: async () => toServiceForm(await WorkServiceService.getWorkServiceById(id)),
    submit: (values) => WorkServiceService.updateWorkService(id, values),
    redirectTo: "/servicos",
    invalidate: [workServiceKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar serviço",
  })

  const remove = useResourceAction({
    mutationFn: () => WorkServiceService.deleteWorkService(id),
    confirm: {
      title: "Excluir serviço?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [workServiceKeys.all, dashboardKeys.all],
    onSuccess: () => navigate("/servicos"),
    errorFallback: "Erro ao excluir serviço",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
