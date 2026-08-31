import { useProductEditForm } from "@/modules/product/hooks/useProductEditForm"
import BackLink from "@/modules/core/components/BackLink"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Package, Edit2, Trash2 } from "lucide-react"

export default function ProductDetail() {
  const { form, onSubmit, loading, handleDelete } = useProductEditForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

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
        <BackLink to="/produtos" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              Detalhes do Produto
            </h1>
            <p className="text-slate-400 font-medium text-sm">Gestão técnica de estoque</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Produto
          </button>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Informações do Produto</h3>
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

              <SelectField
                label="Fornecedor"
                options={supplierOptions}
                error={errors.supplier_id?.message}
                registration={register("supplier_id")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nome"
                error={errors.name?.message}
                registration={register("name")}
              />
              <FormField
                label="Marca"
                error={errors.brand?.message}
                registration={register("brand")}
              />
            </div>

            <FormField
              label="Referência/SKU"
              error={errors.reference?.message}
              registration={register("reference")}
            />

            <FormField
              label="Descrição"
              error={errors.description?.message}
              registration={register("description")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Qtd em Estoque"
                type="number"
                error={errors.stock_quantity?.message}
                registration={register("stock_quantity")}
              />
              <FormField
                label="Preço Unitário"
                type="number"
                step="0.01"
                error={errors.unit_price?.message}
                registration={register("unit_price")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                Salvar Alterações
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
