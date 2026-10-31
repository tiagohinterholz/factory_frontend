import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { usePurchaseOrderEditForm } from "../hooks/usePurchaseOrderEditForm"
import BackLink from "@/modules/core/components/BackLink"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { idOf } from "@/api/dto"
import { SupplierLiveSelect, useSupplierRelations } from "@/modules/supplier"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Plus, Trash2, PackageCheck, XCircle, Eye } from "lucide-react"
import { formatDateTime, formatMoney } from "@/modules/core/utils/format"
import { purchaseOrderStatusTone, purchaseOrderIsOpen, purchaseOrderItemDefaults } from "../domain"

export default function PurchaseOrderEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const {
    form,
    onSubmit,
    loading,
    items,
    status,
    total,
    receivedAt,
    cancelledAt,
    relatedSupplier,
    addItem,
    removeItem,
    handleReceive,
    receiving,
    handleCancel,
  } = usePurchaseOrderEditForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const [itemForm, setItemForm] = useState(purchaseOrderItemDefaults)
  const [savingItem, setSavingItem] = useState(false)

  const supplierId = watch("supplier_id")
  const { products: supplierProducts } = useSupplierRelations(supplierId)

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  const open = purchaseOrderIsOpen(status)
  const statusDate =
    status === "recebido" ? receivedAt : status === "cancelado" ? cancelledAt : null

  const supplierLabel = (supplier) => supplier?.corporate_name || `Fornecedor #${idOf(supplier)}`
  const relatedSupplierOption = relatedSupplier && {
    id: idOf(relatedSupplier),
    name: supplierLabel(relatedSupplier),
  }

  const productOptions = supplierProducts.map((p) => ({
    id: p.id,
    name: `${p.name} (estoque: ${p.stock_quantity ?? 0})`,
  }))

  function handleProductChange(productId) {
    const product = supplierProducts.find((p) => String(p.id) === String(productId))
    setItemForm((current) => ({
      ...current,
      product_id: productId,
      unit_cost: product ? product.unit_price : "",
    }))
  }

  async function handleAddItem(event) {
    event.preventDefault()
    if (!itemForm.product_id || !itemForm.unit_cost || savingItem) return
    setSavingItem(true)
    try {
      await addItem({
        product_id: itemForm.product_id,
        quantity: itemForm.quantity,
        unit_cost: itemForm.unit_cost,
      })
      setItemForm(purchaseOrderItemDefaults)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao adicionar item").message)
    } finally {
      setSavingItem(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <BackLink to="/compras" />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Pedido de Compra #{id}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm uppercase font-bold tracking-wider">
            <p className="text-slate-400">Ajuste os detalhes e itens</p>
            <span className={`px-2 py-0.5 rounded-md ${purchaseOrderStatusTone(status)}`}>
              {status}
            </span>
            {statusDate && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium normal-case tracking-normal">
                {formatDateTime(statusDate)}
              </span>
            )}
          </div>
        </div>
        {open && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleReceive}
              disabled={receiving || items.length === 0}
              title={items.length === 0 ? "Adicione ao menos um item primeiro" : undefined}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <PackageCheck size={18} /> Receber
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm shadow-sm transition-all"
            >
              <XCircle size={18} /> Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Informações Gerais</h2>
            {!open && (
              <p className="text-[13px] text-slate-500 -mt-4 mb-4">
                Pedido {status} — edição bloqueada, só exibindo os dados.
              </p>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <SupplierLiveSelect
                    label="Fornecedor"
                    value={supplierId}
                    onChange={(value) => setValue("supplier_id", value)}
                    disabled={!open}
                    error={errors.supplier_id?.message}
                    extraOption={relatedSupplierOption}
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
              <FormField
                label="Observações"
                disabled={!open}
                error={errors.notes?.message}
                registration={register("notes")}
              />
              <PrimaryButton type="submit" disabled={isSubmitting || !open}>
                Salvar Alterações
              </PrimaryButton>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-brand" /> Itens
            </h2>

            {open && (
              <form
                onSubmit={handleAddItem}
                className="flex flex-wrap gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl"
              >
                <div className="flex-1 min-w-[200px]">
                  <SelectField
                    label="Produto"
                    value={itemForm.product_id}
                    onChange={(event) => handleProductChange(event.target.value)}
                    options={productOptions}
                    disabled={!supplierId}
                    disabledHint="Selecione o fornecedor primeiro"
                  />
                </div>
                <div className="w-24">
                  <FormField
                    label="Qtd"
                    type="number"
                    value={itemForm.quantity}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, quantity: event.target.value }))
                    }
                  />
                </div>
                <div className="w-32">
                  <FormField
                    label="Custo unit."
                    readOnly
                    disabled
                    type="number"
                    step="0.01"
                    value={itemForm.unit_cost}
                  />
                </div>
                <button
                  title="Adicionar item"
                  aria-label="Adicionar item"
                  type="submit"
                  disabled={savingItem}
                  className="p-3 bg-brand text-white rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50"
                >
                  <Plus size={24} />
                </button>
              </form>
            )}

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                  <span>
                    {item.product?.name} (x{item.quantity})
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">{formatMoney(item.total)}</span>
                    {open && (
                      <button
                        type="button"
                        title="Remover item"
                        aria-label="Remover item"
                        onClick={() => removeItem(item.id)}
                        className="text-rose-400 hover:text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-slate-400 py-4 text-center">Nenhum item adicionado.</p>
              )}
            </div>
          </div>

          <div className="card-premium flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">Total geral</span>
            <span className="text-2xl font-extrabold text-brand">{formatMoney(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
