import { useVehicleModelForm } from "@/modules/vehiclemodel/hooks/useVehicleModelForm"
import BackLink from "@/modules/core/components/BackLink"
import { useManufacturerOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Layers, Save } from "lucide-react"

export default function VehicleModelCreate() {
  const { form, onSubmit } = useVehicleModelForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const { manufacturers, loading } = useManufacturerOptions()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-xl mx-auto">
        <BackLink to="/modelos" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Modelo</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Adicione um modelo ao catálogo de veículos
        </p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Cadastro de Modelo</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <SelectField
              label="Marca"
              options={manufacturers}
              error={errors.manufacturer_id?.message}
              registration={register("manufacturer_id")}
            />

            <FormField
              label="Nome do Modelo"
              placeholder="Ex: Corolla"
              error={errors.name?.message}
              registration={register("name")}
            />

            <div className="pt-4">
              <PrimaryButton type="submit" icon={Save} disabled={isSubmitting}>
                Salvar Modelo
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
