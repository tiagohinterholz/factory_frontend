import { useLocation, useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { useVehicleForm } from "@/modules/vehicle/hooks/useVehicleForm"
import { useClientOptions } from "@/modules/core/hooks/options"
import { useManufacturerOptions } from "@/modules/core/hooks/options"
import { useModelOptionsByManufacturer } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import BackLink from "@/modules/core/components/BackLink"
import {
  fuelOptions,
  manufactureYearOptions,
  modelYearOptions,
  VEHICLE_COLOR_OPTIONS,
} from "../constants/vehicle"
import { Save } from "lucide-react"

export default function VehicleCreate() {
  const location = useLocation()
  const navigate = useNavigate()
  const { form, onSubmit } = useVehicleForm({ clientId: location.state?.clientId })
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const manufacturerId = watch("manufacturer_id")

  const { client: clients, loading: loadingClients } = useClientOptions()
  const { manufacturers, loading: loadingManufacturers } = useManufacturerOptions()
  const { modelsByManufacturer, loading: loadingModels } =
    useModelOptionsByManufacturer(manufacturerId)

  const clientOptions = clients.map((c) => ({ id: c.id, name: c.display_name }))

  if (loadingClients || loadingManufacturers || (manufacturerId && loadingModels)) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

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
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SelectField
                  label="Cliente Proprietário"
                  options={clientOptions}
                  error={errors.client_id?.message}
                  registration={register("client_id")}
                />
              </div>
              <button
                type="button"
                title="Cadastrar novo cliente"
                onClick={() => navigate("/clientes/novo")}
                className="h-[46px] w-[46px] shrink-0 grid place-items-center rounded-xl border border-line text-brand hover:bg-brand-subtle transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

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
                label="Combustível"
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
