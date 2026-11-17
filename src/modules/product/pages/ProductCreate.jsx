import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProductForm } from "@/modules/product/hooks/useProductForm"
import BackLink from "@/modules/core/components/BackLink"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import ProductFormFields from "@/modules/product/components/ProductFormFields"
import ProductFinancialEntryModal from "@/modules/product/components/ProductFinancialEntryModal"
import { Package, Save } from "lucide-react"

export default function ProductCreate() {
  const navigate = useNavigate()
  const [createdProduct, setCreatedProduct] = useState(null)

  const { form, onSubmit } = useProductForm({
    redirectTo: null,
    onSuccess: (product) => setCreatedProduct(product),
  })
  const {
    formState: { isSubmitting },
  } = form

  function finishFlow() {
    setCreatedProduct(null)
    navigate("/produtos")
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
            <ProductFormFields form={form} />

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Adicionar Produto
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>

      <ProductFinancialEntryModal
        open={Boolean(createdProduct)}
        product={createdProduct}
        onClose={finishFlow}
      />
    </div>
  )
}
