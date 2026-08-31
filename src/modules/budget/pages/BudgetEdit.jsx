import { useState } from "react"
import { useParams } from "react-router-dom"
import { useBudgetEditForm } from "../hooks/useBudgetEditForm"
import { BudgetService } from "../services/budgets"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import { useVehicle } from "@/modules/vehicle/hooks/useVehicle"
import { useProduct } from "@/modules/product/hooks/useProduct"
import { useWorkService } from "@/modules/workservice/hooks/useWorkService"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react"

export default function BudgetEdit() {
  const { id } = useParams()
  const toast = useToast()
  const {
    form,
    onSubmit,
    loading,
    products,
    services,
    status,
    handleDelete,
    handleApprove,
    handleCancel,
    refresh,
  } = useBudgetEditForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const businessId = watch("business_id")
  const clientId = watch("client_id")

  const { business: businesses } = useBusiness()
  const { client: clients } = useClient()
  const { vehicle: vehicles } = useVehicle()
  const { product: allProducts } = useProduct()
  const { workservice: allServices } = useWorkService()

  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedService, setSelectedService] = useState("")

  async function handleAddProduct(event) {
    event.preventDefault()
    if (!selectedProduct) return
    const product = allProducts.find((item) => String(item.id) === String(selectedProduct))
    try {
      await BudgetService.budgetProductCreate(id, {
        product_id: selectedProduct,
        budget_id: id,
        quantity,
        unit_price: product?.unit_price,
      })
      setSelectedProduct("")
      setQuantity(1)
      refresh()
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao adicionar produto").message)
    }
  }

  async function handleAddService(event) {
    event.preventDefault()
    if (!selectedService) return
    const service = allServices.find((item) => String(item.id) === String(selectedService))
    try {
      await BudgetService.budgetServiceCreate(id, {
        service_id: selectedService,
        budget_id: id,
        unit_price: service?.unit_price,
      })
      setSelectedService("")
      refresh()
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao adicionar serviço").message)
    }
  }

  async function handleDeleteProduct(itemId) {
    try {
      await BudgetService.budgetProductDelete(id, itemId)
      refresh()
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao remover produto").message)
    }
  }

  async function handleDeleteService(itemId) {
    try {
      await BudgetService.budgetServiceDelete(id, itemId)
      refresh()
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao remover serviço").message)
    }
  }

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))
  const clientOptions = clients
    .filter((c) => !businessId || String(c.business?.id || c.business) === String(businessId))
    .map((c) => ({ id: c.id, name: `${c.first_name} ${c.last_name}` }))
  const vehicleOptions = vehicles
    .filter((v) => !clientId || String(v.client?.id || v.client) === String(clientId))
    .map((v) => ({ id: v.id, name: `${v.manufacturer} ${v.model} (${v.plate})` }))

  const isPending = status === "pendente"

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Editar Orçamento</h1>
          <div className="flex items-center gap-3 mt-1 text-sm uppercase font-bold tracking-wider">
            <p className="text-slate-400">Ajuste os detalhes e itens</p>
            <span
              className={`px-2 py-0.5 rounded-md ${
                status === "aprovado"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "cancelado"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <>
              <button
                type="button"
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-sm shadow-sm transition-all"
              >
                <CheckCircle size={18} /> Aprovar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm shadow-sm transition-all"
              >
                <XCircle size={18} /> Cancelar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="p-3 bg-danger-subtle text-danger rounded-xl hover:bg-rose-100 font-bold text-sm"
          >
            Deletar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Informações Gerais</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <SelectField
                label="Empreendimento"
                options={businessOptions}
                error={errors.business_id?.message}
                registration={register("business_id", {
                  onChange: () => {
                    setValue("client_id", "")
                    setValue("vehicle_id", "")
                  },
                })}
              />
              <SelectField
                label="Cliente"
                options={clientOptions}
                error={errors.client_id?.message}
                registration={register("client_id", {
                  onChange: () => setValue("vehicle_id", ""),
                })}
              />
              <SelectField
                label="Veículo"
                options={vehicleOptions}
                error={errors.vehicle_id?.message}
                registration={register("vehicle_id")}
              />
              <FormField
                label="Validade"
                type="date"
                error={errors.valid_until?.message}
                registration={register("valid_until")}
              />
              <PrimaryButton type="submit" disabled={isSubmitting}>
                Salvar Alterações
              </PrimaryButton>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-brand" /> Produtos e Peças
            </h2>

            {isPending && (
              <form
                onSubmit={handleAddProduct}
                className="flex flex-wrap gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl"
              >
                <div className="flex-1 min-w-[200px]">
                  <SelectField
                    label="Selecionar Produto"
                    value={selectedProduct}
                    onChange={(event) => setSelectedProduct(event.target.value)}
                    options={allProducts.map((p) => ({
                      id: p.id,
                      name: `${p.name} (R$ ${p.unit_price})`,
                    }))}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    label="Qtd"
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="p-3 bg-brand text-white rounded-xl hover:bg-brand-hover transition-colors"
                >
                  <Plus size={24} />
                </button>
              </form>
            )}

            <div className="divide-y divide-slate-100">
              {products.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                  <span>
                    {item.product?.name} (x{item.quantity})
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">
                      R$ {parseFloat(item.total || 0).toFixed(2)}
                    </span>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(item.id)}
                        className="text-rose-400 hover:text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-slate-400 py-4 text-center">Nenhum produto adicionado.</p>
              )}
            </div>
          </div>

          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-brand" /> Mão de Obra e Serviços
            </h2>

            {isPending && (
              <form
                onSubmit={handleAddService}
                className="flex flex-wrap gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl"
              >
                <div className="flex-1 min-w-[200px]">
                  <SelectField
                    label="Selecionar Serviço"
                    value={selectedService}
                    onChange={(event) => setSelectedService(event.target.value)}
                    options={allServices.map((s) => ({
                      id: s.id,
                      name: `${s.name} (R$ ${s.unit_price})`,
                    }))}
                  />
                </div>
                <button
                  type="submit"
                  className="p-3 bg-brand text-white rounded-xl hover:bg-brand-hover transition-colors"
                >
                  <Plus size={24} />
                </button>
              </form>
            )}

            <div className="divide-y divide-slate-100">
              {services.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                  <span>{item.service?.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">
                      R$ {parseFloat(item.unit_price || 0).toFixed(2)}
                    </span>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleDeleteService(item.id)}
                        className="text-rose-400 hover:text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-slate-400 py-4 text-center">Nenhum serviço adicionado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
