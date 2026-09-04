import { Link, useParams, useNavigate } from "react-router-dom"
import { Edit, Trash2, Eye, ChevronRight, ClipboardList, FileText } from "lucide-react"
import { useVehicleEditForm } from "@/modules/vehicle/hooks/useVehicleEditForm"
import { useVehicleHistory } from "@/modules/vehicle/hooks/useVehicleHistory"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { useClientOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import BackLink from "@/modules/core/components/BackLink"
import RelatedDataCard from "@/modules/core/components/RelatedDataCard"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { fuelOptions } from "../constants/vehicle"

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
  const navigate = useNavigate()

  const { form, onSubmit, loading, handleDelete } = useVehicleEditForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { canChooseBusiness } = usePermissions()
  const clientId = watch("client_id")

  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()
  const { client: clients, loading: loadingClients } = useClientOptions()
  const { orders, budgets, loading: loadingHistory } = useVehicleHistory(id)

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))
  const clientOptions = clients.map((c) => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name}`,
  }))

  if (loading || loadingBusinesses || loadingClients) return <p className="p-6">Carregando...</p>

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
              {canChooseBusiness && (
                <SelectField
                  label="Empreendimento"
                  options={businessOptions}
                  error={errors.business_id?.message}
                  registration={register("business_id")}
                />
              )}

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
                  title="Ver / editar cliente vinculado"
                  disabled={!clientId}
                  onClick={() => navigate(`/clientes/${clientId}`)}
                  className="h-[46px] w-[46px] shrink-0 grid place-items-center rounded-xl border border-line text-muted hover:text-ink hover:bg-ground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Fabricante"
                  error={errors.manufacturer?.message}
                  registration={register("manufacturer")}
                />
                <FormField
                  label="Modelo"
                  error={errors.model?.message}
                  registration={register("model")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Ano de Fabricação"
                  type="number"
                  error={errors.year?.message}
                  registration={register("year")}
                />
                <FormField
                  label="Ano do Modelo"
                  type="number"
                  error={errors.year_model?.message}
                  registration={register("year_model")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Placa"
                  error={errors.plate?.message}
                  registration={register("plate", {
                    onChange: (event) => setValue("plate", event.target.value.toUpperCase()),
                  })}
                />
                <FormField
                  label="Cor"
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
