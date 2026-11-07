import { useId, useState } from "react"
import { Plus, X } from "lucide-react"
import LiveSelect from "@/modules/core/components/LiveSelect"
import { formatMoney } from "@/modules/core/utils/format"

export default function ServiceItemForm({ services = [], saving = false, onAdd }) {
  const nameId = useId()
  const priceId = useId()
  const [serviceId, setServiceId] = useState("")
  const [custom, setCustom] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [error, setError] = useState("")

  const options = services.map((service) => ({
    id: service.id,
    name: `${service.name} (${formatMoney(service.unit_price)})`,
    searchText: service.name,
  }))

  function reset() {
    setServiceId("")
    setCustom(false)
    setCustomName("")
    setCustomPrice("")
    setError("")
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return
    let payload
    if (custom) {
      const name = customName.trim()
      const price = Number(String(customPrice).replace(",", "."))
      if (!name || !(price > 0)) {
        setError("Informe o nome do serviço e um valor maior que zero.")
        return
      }
      payload = { custom_name: name, unit_price: price.toFixed(2) }
    } else {
      if (!serviceId) return
      payload = { service_id: serviceId }
    }
    setError("")
    if ((await onAdd(payload)) !== false) reset()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl"
    >
      {custom ? (
        <>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor={nameId} className="label-premium">
              Nome do serviço *
            </label>
            <input
              id={nameId}
              className="input-premium"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Ex: Funilaria na porta traseira"
              autoFocus
            />
          </div>
          <div className="w-40">
            <label htmlFor={priceId} className="label-premium">
              Valor (R$) *
            </label>
            <input
              id={priceId}
              type="number"
              min="0.01"
              step="0.01"
              className="input-premium"
              value={customPrice}
              onChange={(event) => setCustomPrice(event.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={reset}
            title="Voltar para o catálogo"
            aria-label="Voltar para o catálogo"
            className="p-3 text-slate-500 rounded-xl hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </>
      ) : (
        <div className="flex-1 min-w-[200px]">
          <LiveSelect
            label="Serviço"
            options={options}
            value={serviceId}
            onChange={setServiceId}
            getSearchText={(option) => option.searchText ?? option.name}
            createLabel="Serviço personalizado"
            onCreateNew={() => {
              setServiceId("")
              setCustom(true)
            }}
          />
        </div>
      )}
      <button
        type="submit"
        disabled={saving}
        title="Adicionar serviço"
        aria-label="Adicionar serviço"
        className="p-3 bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-50"
      >
        <Plus size={24} />
      </button>
      {error && <p className="w-full text-xs text-danger">{error}</p>}
    </form>
  )
}
