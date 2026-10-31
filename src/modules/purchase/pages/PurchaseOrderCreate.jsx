import { useNavigate } from "react-router-dom"
import { usePurchaseOrderForm } from "../hooks/usePurchaseOrderForm"
import BackLink from "@/modules/core/components/BackLink"
import { SupplierLiveSelect } from "@/modules/supplier"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Eye } from "lucide-react"

export default function PurchaseOrderCreate() {
  const navigate = useNavigate()
  const { form, onSubmit } = usePurchaseOrderForm()
  const {
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const supplierId = watch("supplier_id")

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
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SupplierLiveSelect
                  label="Fornecedor"
                  value={supplierId}
                  onChange={(value) => setValue("supplier_id", value)}
                  error={errors.supplier_id?.message}
                />
              </div>
              <button
                type="button"
                title="Ver fornecedor vinculado"
                disabled={!supplierId}
                onClick={() => navigate(`/fornecedores/${supplierId}`)}
                className="h-[46px] w-[46px] shrink-0 grid place-items-center rounded-xl border border-line text-muted hover:text-ink hover:bg-ground transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
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
