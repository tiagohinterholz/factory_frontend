import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { ManufacturerService } from "@/modules/manufacturer/services/manufacturer"
import { manufacturerSchema, manufacturerDefaults, manufacturerKeys } from "../domain"

export function useManufacturerForm() {
  return useResourceForm({
    schema: manufacturerSchema,
    defaultValues: manufacturerDefaults,
    submit: (values) => ManufacturerService.createManufacturer(values),
    redirectTo: "/marcas",
    invalidate: [manufacturerKeys.all],
    errorFallback: "Erro ao criar marca",
  })
}
