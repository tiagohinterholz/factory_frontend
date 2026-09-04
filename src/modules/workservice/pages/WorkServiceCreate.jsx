import { useNavigate } from "react-router-dom"
import { useWorkServiceForm } from "@/modules/workservice/hooks/useWorkServiceForm"
import BackLink from "@/modules/core/components/BackLink"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Save, Milestone, Plus } from "lucide-react"

export default function WorkServiceCreate() {
  const navigate = useNavigate()
  const { form, onSubmit } = useWorkServiceForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const { canChooseBusiness } = usePermissions()
  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()
  const { supplier: suppliers, loading: loadingSuppliers } = useSupplierOptions()

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))
  const supplierOptions = suppliers.map((s) => ({ id: s.id, name: s.corporate_name }))

  if (loadingBusinesses || loadingSuppliers) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/servicos" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Serviço</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">Cadastro de serviços disponíveis</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Milestone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados do Serviço</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    label="Fornecedor"
                    options={supplierOptions}
                    error={errors.supplier_id?.message}
                    registration={register("supplier_id")}
                  />
                </div>
                <button
                  type="button"
                  title="Cadastrar novo fornecedor"
                  onClick={() => navigate("/fornecedores/novo")}
                  className="h-[46px] w-[46px] shrink-0 grid place-items-center rounded-xl border border-line text-brand hover:bg-brand-subtle transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nome do Serviço"
                placeholder="Ex: Troca de óleo"
                error={errors.name?.message}
                registration={register("name")}
              />
              <FormField
                label="Descrição"
                placeholder="Detalhes técnicos..."
                error={errors.description?.message}
                registration={register("description")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Preço Unitário"
                type="number"
                step="0.01"
                error={errors.unit_price?.message}
                registration={register("unit_price")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Adicionar Serviço
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
