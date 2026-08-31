import { useProductForm } from "@/modules/product/hooks/useProductForm"
import BackLink from "@/modules/core/components/BackLink"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Package, Save } from "lucide-react"

export default function ProductCreate() {
  const { form, onSubmit } = useProductForm()
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
        <BackLink to="/produtos" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Produto</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">Cadastro de itens para estoque</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados do Produto</h3>
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
                label="Nome do Produto"
                placeholder="Ex: Óleo 5W30"
                error={errors.name?.message}
                registration={register("name")}
              />
              <FormField
                label="Marca"
                placeholder="Ex: Castrol"
                error={errors.brand?.message}
                registration={register("brand")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Referência/SKU"
                placeholder="Ex: REF-123"
                error={errors.reference?.message}
                registration={register("reference")}
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
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Salvar Produto
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
