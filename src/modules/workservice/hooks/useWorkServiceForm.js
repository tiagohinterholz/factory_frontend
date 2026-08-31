import { useLocation } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { WorkServiceService } from "@/modules/workservice/services/workservice"
import { serviceSchema, serviceDefaults } from "../service.schema"

export function useWorkServiceForm() {
  const location = useLocation()
  const { businessId } = useAuth()

  return useResourceForm({
    schema: serviceSchema,
    defaultValues: {
      ...serviceDefaults,
      business_id: businessId ? String(businessId) : "",
      supplier_id: location.state?.supplierId ? String(location.state.supplierId) : "",
    },
    submit: (values) => WorkServiceService.createWorkService(values),
    redirectTo: "/servicos",
    errorFallback: "Erro ao criar serviço",
  })
}
