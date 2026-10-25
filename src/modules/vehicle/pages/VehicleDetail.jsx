import { Link, useParams } from "react-router-dom"
import { Trash2, ChevronRight, ClipboardList, FileText } from "lucide-react"
import { useVehicleEditForm } from "@/modules/vehicle/hooks/useVehicleEditForm"
import { useVehicleHistory } from "@/modules/vehicle/hooks/useVehicleHistory"
import { ClientLiveSelect } from "@/modules/client"
import ManufacturerLiveSelect from "@/modules/vehicle/components/ManufacturerLiveSelect"
import ModelLiveSelect from "@/modules/vehicle/components/ModelLiveSelect"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import BackLink from "@/modules/core/components/BackLink"
import RelatedDataCard from "@/modules/core/components/RelatedDataCard"
import {
  fuelOptions,
  manufactureYearOptions,
  modelYearOptions,
  VEHICLE_COLOR_OPTIONS,
} from "../constants/vehicle"
import { PLATE_MASK, PLATE_MASK_REPLACEMENT } from "@/modules/core/schemas/br-fields"
import { Edit } from "lucide-react"

function HistoryLink({ item, prefix, singular }) {
  return (
    <Link
      to={`${prefix}/${item.id}`}
      className="p-3 bg-ground rounded-lg border border-line flex items-center justify-between group transition-colors hover:bg-surface hover:border-brand/30"
    >
      <div>
        <p className="font-medium text-ink text-sm">
          {singular} #{item.id}
        </p>
        <p className="text-[12px] text-muted mt-0.5">{item.status}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand transition-colors" />
    </Link>
  )
}

export default function VehicleEdit() {
  const { id } = useParams()

  const { form, onSubmit, loading, handleDelete } = useVehicleEditForm()
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const clientId = watch("client_id")
  const manufacturerId = watch("manufacturer_id")
  const modelId = watch("model_id")

  const { orders, budgets, loading: loadingHistory } = useVehicleHistory(id)

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <BackLink to="/veiculos" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Editar Veículo</h1>
          <p className="text-slate-400 font-medium text-sm">Sincronize os dados técnicos</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <div className="card-premium">
            <form className="space-y-6" onSubmit={onSubmit}>
              <ClientLiveSelect
                label="Cliente Proprietário *"
                value={clientId}
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
                  error={errors.plate?.message}
                />
                <FormField
                  label="Cor"
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
                  error={errors.mileage?.message}
                  registration={register("mileage")}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <PrimaryButton type="submit" icon={Edit} fullWidth={false} disabled={isSubmitting}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <RelatedDataCard
            title="OS Vinculadas"
            icon={ClipboardList}
            items={orders}
            loading={loadingHistory}
            emptyMessage="Este veículo ainda não tem ordens de serviço."
            renderItem={(item) => <HistoryLink item={item} prefix="/ordens" singular="OS" />}
          />
          <RelatedDataCard
            title="Orçamentos Vinculados"
            icon={FileText}
            items={budgets}
            loading={loadingHistory}
            emptyMessage="Este veículo ainda não tem orçamentos."
            renderItem={(item) => (
              <HistoryLink item={item} prefix="/orcamentos" singular="Orçamento" />
            )}
          />
        </div>
      </div>
    </div>
  )
}
