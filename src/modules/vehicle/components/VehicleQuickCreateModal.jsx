import { useEffect } from "react"
import { useVehicleForm } from "@/modules/vehicle/hooks/useVehicleForm"
import Modal from "@/modules/core/components/Modal"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useManufacturerOptions, useModelOptionsByManufacturer } from "@/modules/core/hooks/options"
import { fuelOptions, manufactureYearOptions, modelYearOptions } from "../constants/vehicle"

export default function VehicleQuickCreateModal({ open, onClose, onCreated, clientId }) {
  const canOpen = Boolean(open && clientId)

  useEffect(() => {
    if (open && !clientId) {
      console.warn(
        "VehicleQuickCreateModal: recusando abrir sem clientId — escolha ou cadastre o cliente primeiro.",
      )
    }
  }, [open, clientId])

  const { form, onSubmit } = useVehicleForm({
    clientId,
    redirectTo: null,
    onSuccess: (vehicle) => {
      onCreated?.(vehicle)
      onClose?.()
      form.reset()
    },
  })
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const manufacturerId = watch("manufacturer_id")

  useEffect(() => {
    setValue("client_id", clientId ? String(clientId) : "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const { manufacturers } = useManufacturerOptions()
  const { modelsByManufacturer } = useModelOptionsByManufacturer(manufacturerId)

  function handleClose() {
    form.reset()
    onClose?.()
  }

  return (
    <Modal open={canOpen} onClose={handleClose} title="Cadastrar novo veículo">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Marca"
            options={manufacturers}
            error={errors.manufacturer_id?.message}
            registration={register("manufacturer_id", {
              onChange: () => setValue("model_id", ""),
            })}
          />
          <SelectField
            label="Modelo"
            options={modelsByManufacturer}
            disabled={!manufacturerId}
            disabledHint="Selecione a marca primeiro"
            error={errors.model_id?.message}
            registration={register("model_id")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Ano de Fabricação"
            options={manufactureYearOptions}
            error={errors.year?.message}
            registration={register("year")}
          />
          <SelectField
            label="Ano do Modelo"
            options={modelYearOptions}
            error={errors.year_model?.message}
            registration={register("year_model")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Placa"
            placeholder="ABC-1234"
            error={errors.plate?.message}
            registration={register("plate", {
              onChange: (event) => setValue("plate", event.target.value.toUpperCase()),
            })}
          />
          <SelectField
            label="Combustível"
            options={fuelOptions}
            error={errors.fuel?.message}
            registration={register("fuel")}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <PrimaryButton type="submit" fullWidth={false} disabled={isSubmitting}>
            Salvar Veículo
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}
