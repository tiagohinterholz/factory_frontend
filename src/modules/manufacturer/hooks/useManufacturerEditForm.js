import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { ManufacturerService } from "@/modules/manufacturer/services/manufacturer"
import { manufacturerSchema, manufacturerDefaults, manufacturerKeys } from "../domain"

export function useManufacturerEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: manufacturerSchema,
    defaultValues: manufacturerDefaults,
    load: async () => {
      const data = await ManufacturerService.getManufacturer(id)
      return { name: data.name ?? "", is_active: data.is_active ?? true }
    },
    submit: (values) => ManufacturerService.updateManufacturer(id, values),
    redirectTo: "/marcas",
    invalidate: [manufacturerKeys.all],
    errorFallback: "Erro ao atualizar marca",
  })

  const remove = useResourceAction({
    mutationFn: () => ManufacturerService.deleteManufacturer(id),
    confirm: {
      title: "Excluir marca?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [manufacturerKeys.all],
    onSuccess: () => navigate("/marcas"),
    errorFallback: "Erro ao excluir marca",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
