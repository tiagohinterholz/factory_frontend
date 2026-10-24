import { useLocation } from "react-router-dom"
import { useVehicleForm } from "@/modules/vehicle/hooks/useVehicleForm"
import { ClientLiveSelect } from "@/modules/client"
import ManufacturerLiveSelect from "@/modules/vehicle/components/ManufacturerLiveSelect"
import ModelLiveSelect from "@/modules/vehicle/components/ModelLiveSelect"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import BackLink from "@/modules/core/components/BackLink"
import {
  fuelOptions,
  manufactureYearOptions,
  modelYearOptions,
  VEHICLE_COLOR_OPTIONS,
} from "../constants/vehicle"
import { PLATE_MASK, PLATE_MASK_REPLACEMENT } from "@/modules/core/schemas/br-fields"
import { Save } from "lucide-react"

export default function VehicleCreate() {
  const location = useLocation()
  const clientId = location.state?.clientId

  const { form, onSubmit } = useVehicleForm({
    clientId,
    redirectTo: clientId ? `/clientes/${clientId}` : (result) => `/veiculos/${result.id}`,
  })
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const selectedClientId = watch("client_id")
  const manufacturerId = watch("manufacturer_id")
  const modelId = watch("model_id")

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/veiculos" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Veículo</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Cadastre as informações técnicas do veículo
        </p>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={onSubmit}>
            <ClientLiveSelect
              label="Cliente Proprietário *"
              value={selectedClientId}
              onChange={(value) => setValue("client_id", value)}
              error={errors.client_id?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ManufacturerLiveSelect
                label="Marca *"
                value={manufacturerId}
                onChange={(value) => {
                  setValue("manufacturer_id", value)
                  setValue("model_id", "")
                }}
                error={errors.manufacturer_id?.message}
              />
              <ModelLiveSelect
                label="Modelo *"
                value={modelId}
                onChange={(value) => setValue("model_id", value)}
                manufacturerId={manufacturerId}
                error={errors.model_id?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Ano de Fabricação *"
                options={manufactureYearOptions}
                error={errors.year?.message}
                registration={register("year")}
              />
              <SelectField
                label="Ano do Modelo *"
                options={modelYearOptions}
                error={errors.year_model?.message}
                registration={register("year_model")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MaskedField
                control={control}
                name="plate"
                label="Placa *"
                mask={PLATE_MASK}
                replacement={PLATE_MASK_REPLACEMENT}
                uppercase
                placeholder="ABC-1234"
                error={errors.plate?.message}
              />
              <FormField
                label="Cor"
                placeholder="Prata"
                datalist={VEHICLE_COLOR_OPTIONS}
                error={errors.color?.message}
                registration={register("color")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Combustível *"
                options={fuelOptions}
                error={errors.fuel?.message}
                registration={register("fuel")}
              />
              <FormField
                label="Quilometragem"
                type="number"
                placeholder="0"
                error={errors.mileage?.message}
                registration={register("mileage")}
              />
            </div>

            <div className="pt-4">
              <PrimaryButton type="submit" icon={Save} disabled={isSubmitting}>
                Salvar Veículo
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
