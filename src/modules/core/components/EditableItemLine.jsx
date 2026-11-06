import { useId, useState } from "react"
import { Check, Pencil, Trash2, X } from "lucide-react"
import { formatMoney } from "@/modules/core/utils/format"

function parsePrice(raw) {
  const text = String(raw).trim()
  if (text === "") return Number.NaN
  return Number(text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text)
}

function LineEditor({ itemName, quantity, unitPrice, availableStock, onSave, onCancel }) {
  const quantityId = useId()
  const priceId = useId()
  const withQuantity = quantity !== undefined
  const [quantityValue, setQuantityValue] = useState(withQuantity ? String(quantity) : "")
  const [priceValue, setPriceValue] = useState(String(unitPrice ?? ""))
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const nextQuantity = Number(quantityValue)
  const nextPrice = parsePrice(priceValue)
  const missing =
    withQuantity &&
    availableStock !== undefined &&
    Number.isInteger(nextQuantity) &&
    nextQuantity > availableStock
      ? nextQuantity - Math.max(0, availableStock)
      : 0
  const previewTotal =
    Number.isFinite(nextPrice) && (!withQuantity || Number.isInteger(nextQuantity))
      ? nextPrice * (withQuantity ? nextQuantity : 1)
      : null

  async function handleSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    if (saving) return
    if (withQuantity && (!Number.isInteger(nextQuantity) || nextQuantity < 1)) {
      setError("Informe uma quantidade inteira maior que zero.")
      return
    }
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      setError("Informe um preço válido (zero ou mais).")
      return
    }
    const payload = {}
    if (withQuantity && nextQuantity !== Number(quantity)) payload.quantity = nextQuantity
    if (nextPrice.toFixed(2) !== Number(unitPrice).toFixed(2)) {
      payload.unit_price = nextPrice.toFixed(2)
    }
    if (Object.keys(payload).length === 0) {
      onCancel()
      return
    }
    setError("")
    setSaving(true)
    const saved = await onSave(payload)
    setSaving(false)
    if (saved !== false) onCancel()
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={`Editar ${itemName}`}
      className="py-3 flex flex-col gap-2 text-sm"
    >
      <span className="font-medium text-ink">{itemName}</span>
      <div className="flex flex-wrap items-end gap-3">
        {withQuantity && (
          <div className="w-24">
            <label htmlFor={quantityId} className="label-premium">
              Qtd
            </label>
            <input
              id={quantityId}
              type="number"
              min="1"
              step="1"
              className="input-premium"
              value={quantityValue}
              onChange={(event) => setQuantityValue(event.target.value)}
              autoFocus
            />
          </div>
        )}
        <div className="w-36">
          <label htmlFor={priceId} className="label-premium">
            {withQuantity ? "Preço unitário (R$)" : "Valor (R$)"}
          </label>
          <input
            id={priceId}
            type="text"
            inputMode="decimal"
            className="input-premium"
            value={priceValue}
            onChange={(event) => setPriceValue(event.target.value)}
            autoFocus={!withQuantity}
          />
        </div>
        {previewTotal !== null && withQuantity && (
          <span className="pb-3 text-muted">
            Total: <span className="font-bold text-ink">{formatMoney(previewTotal)}</span>
          </span>
        )}
        <div className="flex items-center gap-1 pb-1.5 ml-auto">
          <button
            type="submit"
            disabled={saving}
            aria-label="Salvar item"
            title="Salvar item"
            className="p-2 rounded-lg text-brand hover:bg-brand-subtle disabled:opacity-50"
          >
            <Check size={18} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar edição"
            title="Cancelar edição"
            className="p-2 rounded-lg text-muted hover:bg-ground"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      {missing > 0 && !error && (
        <p role="status" className="text-xs font-medium text-warn">
          Estoque disponível para esta linha: {Math.max(0, availableStock)} — vão faltar {missing}{" "}
          un. A peça fica anotada para comprar.
        </p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  )
}

export default function EditableItemLine({
  itemName,
  badge = null,
  quantity,
  unitPrice,
  total,
  editable = false,
  availableStock,
  onSave,
  onDelete,
}) {
  const [editing, setEditing] = useState(false)
  const withQuantity = quantity !== undefined

  if (editing && editable) {
    return (
      <LineEditor
        itemName={itemName}
        quantity={quantity}
        unitPrice={unitPrice}
        availableStock={availableStock}
        onSave={onSave}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="py-3 flex justify-between items-center text-sm">
      <span className="flex items-center gap-2">
        {withQuantity ? `${itemName} (x${quantity})` : itemName}
        {badge}
      </span>
      <div className="flex items-center gap-4">
        {withQuantity && <span className="text-slate-400">{formatMoney(unitPrice)} / un</span>}
        <span className="font-bold text-slate-700">
          {formatMoney(withQuantity ? total : unitPrice)}
        </span>
        {editable && (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Editar ${itemName}`}
              title="Editar quantidade e preço"
              className="text-slate-400 hover:text-brand"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Remover ${itemName}`}
              className="text-rose-400 hover:text-danger"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
