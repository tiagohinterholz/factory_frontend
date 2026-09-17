import { usePurchaseOrderForm } from "../hooks/usePurchaseOrderForm"
import BackLink from "@/modules/core/components/BackLink"
import { useSupplierOptions } from "@/modules/core/hooks/options"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function PurchaseOrderCreate() {
  const { form, onSubmit } = usePurchaseOrderForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const { supplier: suppliers, loading: loadingSuppliers } = useSupplierOptions()
  const supplierOptions = suppliers.map((s) => ({ id: s.id, name: s.corporate_name }))

  if (loadingSuppliers) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/compras" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
          Novo Pedido de Compra
        </h1>
        <p className="text-slate-400 font-medium text-sm mb-8">Escolha o fornecedor pra começar</p>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={onSubmit}>
            <SelectField
              label="Fornecedor"
              options={supplierOptions}
              error={errors.supplier_id?.message}
              registration={register("supplier_id")}
            />
            <p className="text-xs text-muted">
              Os itens (produtos, quantidade, custo) são adicionados na próxima tela.
            </p>
            <div className="pt-4">
              <PrimaryButton type="submit" disabled={isSubmitting}>
                Prosseguir para Itens
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
