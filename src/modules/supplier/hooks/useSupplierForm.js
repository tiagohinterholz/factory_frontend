import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { supplierSchema, supplierDefaults } from "../supplier.schema"

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
    errorFallback: "Erro ao criar fornecedor",
  })
}
