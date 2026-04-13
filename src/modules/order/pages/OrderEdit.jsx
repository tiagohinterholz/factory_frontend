import { useOrderEditForm } from "../hooks/useOrderEditForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import { useVehicle } from "@/modules/vehicle/hooks/useVehicle"
import { useBudget } from "@/modules/budget/hooks/useBudget"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { orderProductCreate, orderProductDelete, orderServiceCreate, orderServiceDelete } from "../services/orders"
import { useProduct } from "@/modules/product/hooks/useProduct"
import { useWorkService } from "@/modules/workservice/hooks/useWorkService"

export default function OrderEdit() {
  const { id } = useParams()
  const {
    business, setBusiness,
    client, setClient,
    vehicle, setVehicle,
    budget, setBudget,
    serviceDate, setServiceDate,
    billingDate, setBillingDate,
    status,
    notes, setNotes,
    products, 
    services,
    loading,
    handleUpdate,
    handleDelete,
    handleInvoice,
    refresh
  } = useOrderEditForm()

  const { business: businesses } = useBusiness()
  const { client: clients } = useClient()
  const { vehicle: vehicles } = useVehicle()
  const { budgets } = useBudget()
  const { product: allProducts } = useProduct()
  const { workservice: allServices } = useWorkService()

  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedService, setSelectedService] = useState("")

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return
    const product = allProducts.find(p => p.id === parseInt(selectedProduct))
    
    try {
      await orderProductCreate(id, { 
        product_id: selectedProduct, 
        order_id: id,
        quantity,
        unit_price: product?.unit_price
      })
      setSelectedProduct("")
      setQuantity(1)
      refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    if (!selectedService) return
    const service = allServices.find(s => s.id === parseInt(selectedService))

    try {
      await orderServiceCreate(id, { 
        service_id: selectedService,
        order_id: id,
        unit_price: service?.unit_price
      })
      setSelectedService("")
      refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteProduct = async (itemId) => {
    await orderProductDelete(id, itemId)
    refresh()
  }

  const handleDeleteService = async (itemId) => {
    await orderServiceDelete(id, itemId)
    refresh()
  }

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  const businessOptions = businesses.map(b => ({ id: b.id, name: b.corporate_name }))
  const clientOptions = clients
    .filter(c => !business || (c.business?.id || c.business) === parseInt(business))
    .map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}` }))
  const vehicleOptions = vehicles
    .filter(v => !client || (v.client?.id || v.client) === parseInt(client))
    .map(v => ({ id: v.id, name: `${v.manufacturer} ${v.model} (${v.plate})` }))
  const budgetOptions = budgets.map(b => ({ id: b.id, name: `Orçamento #${b.id}` }))

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Editar Ordem de Serviço</h1>
          <div className="flex items-center gap-3 mt-1 text-sm uppercase font-bold tracking-wider">
            <p className="text-slate-400">Gestão técnica e faturamento</p>
            <span className={`px-2 py-0.5 rounded-md ${
              status === 'faturado' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {status === 'a faturar' && (
            <button
              type="button"
              onClick={handleInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-sm shadow-sm transition-all"
            >
              Faturar OS
            </button>
          )}
          <button type="button" onClick={handleDelete} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 font-bold text-sm">
            Deletar OS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Informações Gerais</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <SelectField 
                label="Empreendimento"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                options={businessOptions}
              />
              <SelectField 
                label="Cliente"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                options={clientOptions}
              />
              <SelectField 
                label="Veículo"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                options={vehicleOptions}
              />
              <SelectField 
                label="Orçamento"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                options={budgetOptions}
              />
              <FormField 
                label="Data do Serviço"
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
              <FormField 
                label="Data do Faturamento"
                type="date"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
              />
              <FormField 
                label="Observações"
                isTextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <PrimaryButton type="submit">Atualizar OS</PrimaryButton>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" /> Peças e Produtos
            </h2>
            
            <form onSubmit={handleAddProduct} className="flex flex-wrap gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl">
              <div className="flex-1 min-w-[200px]">
                <SelectField 
                  label="Selecionar Produto"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  options={allProducts.map(p => ({ id: p.id, name: `${p.name} (R$ ${p.unit_price})` }))}
                />
              </div>
              <div className="w-24">
                <FormField 
                  label="Qtd"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                <Plus size={24} />
              </button>
            </form>

            <div className="divide-y divide-slate-100">
              {products.map(item => (
                <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                  <span>{item.product?.name} (x{item.quantity})</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">R$ {parseFloat(item.total || 0).toFixed(2)}</span>
                    <button onClick={() => handleDeleteProduct(item.id)} className="text-rose-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p className="text-slate-400 py-4 text-center">Nenhum produto adicionado.</p>}
            </div>
          </div>

          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" /> Mão de Obra e Serviços
            </h2>

            <form onSubmit={handleAddService} className="flex flex-wrap gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl">
              <div className="flex-1 min-w-[200px]">
                <SelectField 
                  label="Selecionar Serviço"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  options={allServices.map(s => ({ id: s.id, name: `${s.name} (R$ ${s.unit_price})` }))}
                />
              </div>
              <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                <Plus size={24} />
              </button>
            </form>

            <div className="divide-y divide-slate-100">
              {services.map(item => (
                <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                  <span>{item.service?.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">R$ {parseFloat(item.unit_price || 0).toFixed(2)}</span>
                    <button onClick={() => handleDeleteService(item.id)} className="text-rose-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-slate-400 py-4 text-center">Nenhum serviço adicionado.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
