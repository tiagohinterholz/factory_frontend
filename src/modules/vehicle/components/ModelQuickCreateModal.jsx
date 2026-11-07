import { useEffect } from "react"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { VehicleModelService } from "@/modules/vehiclemodel"
import {
  vehicleModelSchema,
  vehicleModelDefaults,
  vehicleModelKeys,
} from "@/modules/vehiclemodel/domain"
import { manufacturerKeys } from "@/modules/manufacturer/domain"
import { useManufacturerOptions } from "@/modules/core/hooks/options"
import Modal from "@/modules/core/components/Modal"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function ModelQuickCreateModal({ open, onClose, onCreated, manufacturerId }) {
  const canOpen = Boolean(open && manufacturerId)

  useEffect(() => {
    if (open && !manufacturerId) {
      console.warn(
        "ModelQuickCreateModal: recusando abrir sem manufacturerId — escolha a marca primeiro.",
      )
    }
  }, [open, manufacturerId])

  const { manufacturers } = useManufacturerOptions()
  const manufacturerName =
    manufacturers.find((manufacturer) => String(manufacturer.id) === String(manufacturerId))
      ?.name ?? ""

  const { form, onSubmit } = useResourceForm({
    schema: vehicleModelSchema,
    defaultValues: {
      ...vehicleModelDefaults,
      manufacturer_id: manufacturerId ? String(manufacturerId) : "",
    },
    submit: (values) => VehicleModelService.createVehicleModel(values),
    redirectTo: null,
    onSuccess: (model) => {
      onCreated?.(model)
      onClose?.()
      form.reset()
    },
    invalidate: [vehicleModelKeys.all, manufacturerKeys.modelsByManufacturer(manufacturerId)],
    errorFallback: "Erro ao criar modelo",
  })
  const {
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  useEffect(() => {
    setValue("manufacturer_id", manufacturerId ? String(manufacturerId) : "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturerId])

  function handleClose() {
    form.reset()
    onClose?.()
  }

  return (
    <Modal open={canOpen} onClose={handleClose} title="Cadastrar novo modelo">
      <form className="space-y-6" onSubmit={onSubmit}>
        <FormField label="Marca" value={manufacturerName} disabled readOnly onChange={() => {}} />

        <FormField
          label="Nome"
          placeholder="Ex: Corolla"
          error={errors.name?.message}
          registration={register("name")}
        />

        <div className="pt-2 flex justify-end">
          <PrimaryButton type="submit" fullWidth={false} disabled={isSubmitting}>
            Salvar Modelo
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}
