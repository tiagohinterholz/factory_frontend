import { useNavigate, useParams } from "react-router-dom"
import { useWorkServiceEditForm } from "@/modules/workservice/hooks/useWorkServiceEditForm"
import BackLink from "@/modules/core/components/BackLink"
import RecordPdfButton from "@/modules/core/components/RecordPdfButton"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { WorkServiceService } from "@/modules/workservice/services/workservice"
import { Settings, Edit2, Trash2, Eye } from "lucide-react"

export default function WorkServiceDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { form, onSubmit, loading, handleDelete } = useWorkServiceEditForm()
  const {
    register,
    watch,
    formState: { errors, isSubmitting },
  } = form

  const supplierId = watch("supplier_id")
  const { canChooseBusiness } = usePermissions()
  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()
  const { supplier: suppliers, loading: loadingSuppliers } = useSupplierOptions()

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))
  const supplierOptions = suppliers.map((s) => ({ id: s.id, name: s.corporate_name }))

  if (loading || loadingBusinesses || loadingSuppliers) {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              Detalhes do Serviço
            </h1>
            <p className="text-slate-400 font-medium text-sm">Gestão de Mão de Obra</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RecordPdfButton
              request={() => WorkServiceService.getWorkServicePdf(id)}
              label="Exportar PDF"
            />
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Serviço
            </button>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Informações do Serviço</h3>
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
                  title="Ver / editar fornecedor vinculado"
                  disabled={!supplierId}
                  onClick={() => navigate(`/fornecedores/${supplierId}`)}
                  className="h-[46px] w-[46px] shrink-0 grid place-items-center rounded-xl border border-line text-muted hover:text-ink hover:bg-ground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <FormField
              label="Nome do Serviço"
              error={errors.name?.message}
              registration={register("name")}
            />

            <FormField
              label="Descrição / Detalhes"
              error={errors.description?.message}
              registration={register("description")}
            />

            <div className="max-w-xs">
              <FormField
                label="Preço do Serviço (Mão de Obra)"
                type="number"
                step="0.01"
                error={errors.unit_price?.message}
                registration={register("unit_price")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                Atualizar Serviço
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
