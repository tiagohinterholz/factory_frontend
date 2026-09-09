import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { supplierSchema, supplierDefaults, supplierKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

export function useSupplierForm() {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: supplierSchema,
    defaultValues: {
      ...supplierDefaults,
      business_id: businessId ? String(businessId) : "",
    },
    submit: (values) => SupplierService.createSupplier(values),
    redirectTo: "/fornecedores",
    invalidate: [supplierKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao criar fornecedor",
  })
}
