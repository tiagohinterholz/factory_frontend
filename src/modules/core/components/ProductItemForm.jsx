import { useId, useState } from "react"
import { Plus } from "lucide-react"
import LiveSelect from "@/modules/core/components/LiveSelect"
import { formatMoney } from "@/modules/core/utils/format"

export default function ProductItemForm({ products = [], saving = false, onAdd }) {
  const quantityId = useId()
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [error, setError] = useState("")

  const options = products.map((product) => ({
    id: product.id,
    name: `${product.brand ? `${product.brand} - ` : ""}${product.name} (${formatMoney(product.unit_price)}) · estoque ${product.stock_quantity ?? 0}`,
    searchText: [product.brand, product.name, product.reference, product.sku]
      .filter(Boolean)
      .join(" "),
  }))

  const selectedProduct = products.find((item) => String(item.id) === String(productId))
  const requested = Number(quantity)
  const available = selectedProduct?.stock_quantity ?? 0
  const missing =
    selectedProduct && Number.isInteger(requested) && requested > available
      ? requested - Math.max(0, available)
      : 0

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving || !productId) return
    const amount = Number(quantity)
    if (!Number.isInteger(amount) || amount < 1) {
      setError("Informe uma quantidade inteira maior que zero.")
      return
    }
    const product = selectedProduct
    setError("")
    const added = await onAdd({
      product_id: productId,
      quantity: amount,
      unit_price: product?.unit_price,
    })
    if (added !== false) {
      setProductId("")
      setQuantity("1")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl"
    >
      <div className="flex-1 min-w-[200px]">
        <LiveSelect
          label="Produto"
          options={options}
          value={productId}
          onChange={setProductId}
          getSearchText={(option) => option.searchText ?? option.name}
        />
      </div>
      <div className="w-24">
        <label htmlFor={quantityId} className="label-premium">
          Qtd
        </label>
        <input
          id={quantityId}
          type="number"
          min="1"
          className="input-premium"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        title="Adicionar produto"
        aria-label="Adicionar produto"
        className="p-3 bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-50"
      >
        <Plus size={24} />
      </button>
      {missing > 0 && !error && (
        <p role="status" className="w-full text-xs font-medium text-warn">
          Estoque disponível: {Math.max(0, available)} — vão faltar {missing} un. O item entra mesmo
          assim e a peça fica anotada para comprar.
        </p>
      )}
      {error && <p className="w-full text-xs text-danger">{error}</p>}
    </form>
  )
}
