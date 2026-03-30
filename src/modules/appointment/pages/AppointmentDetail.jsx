import { useAppointmentEditForm } from "@/modules/appointment/hooks/useAppointmentEditForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useVehicle } from "@/modules/vehicle/hooks/useVehicle"
import { useOrder } from "@/modules/order/hooks/useOrder"
import { useEffect } from "react"


import { Edit, Trash2 } from "lucide-react"


export default function AppointmentDetail() {
  const {
    business, setBusiness,
    client, setClient,
    vehicle, setVehicle,
    order, setOrder,
    date, setDate,
    time, setTime,
    observation, setObservation,
    loading,
    handleUpdate,
    handleDelete
  } = useAppointmentEditForm()
  
  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const { client: clients, loading: loadingClients } = useClient()
  const { vehicle: vehicles, loading: loadingVehicles } = useVehicle()
  const { order: orders, loading: loadingOrders } = useOrder()

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  // Inicializar business se não for superuser e estiver vazio
  useEffect(() => {
    if (!loading && !isSuperUser && user.business_id && !business) {
      setBusiness(user.business_id)
    }
  }, [loading, isSuperUser, user.business_id, business, setBusiness])

  // Limpar seleções dependentes ao trocar o pai, mas ignorar o primeiro carregamento
  useEffect(() => {
    if (!loading && isSuperUser) {
        // Logic can be added here if needed for superuser switching business
    }
  }, [business, client, vehicle, loading, isSuperUser])

  const businessOptions = businesses.map(b => ({
    id: b.id,
    name: b.corporate_name
  }))

  const clientOptions = clients
    .filter(c => {
      const bizId = c.business?.id || c.business;
      return !business || bizId === parseInt(business);
    })
    .map(c => ({
      id: c.id,
      name: c.first_name + " " + c.last_name
    }))

  const vehicleOptions = vehicles
    .filter(v => {
      const clId = v.client?.id || v.client;
      return !client || clId === parseInt(client);
    })
    .map(v => ({
      id: v.id,
      name: (v.manufacturer || "") + " " + (v.model || "") + " " + (v.year || "")
    }))

  const orderOptions = orders
    .filter(o => {
      const vhId = o.vehicle?.id || o.vehicle;
      return !vehicle || vhId === parseInt(vehicle);
    })
    .map(o => ({
      id: o.id,
      name: `OS ${o.id} - ${o.plate || ""}`
    }))

  if (loading || loadingBusinesses || loadingClients || loadingVehicles || loadingOrders) return <p className="p-6 text-slate-500 font-medium">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Editar Agendamento</h1>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">Sincronize os dados do agendamento</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={handleUpdate}>
            
            {isSuperUser && (
              <SelectField 
                label="Empreendimento"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                options={businessOptions}
              />
            )}

            <SelectField 
                label="Cliente Proprietário"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                options={clientOptions}
                disabled={!business && isSuperUser}
              />
            
            <SelectField 
                label="Veículo"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                options={vehicleOptions}
                disabled={!client}
              />

            <SelectField 
                label="Ordem de Serviço"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                options={orderOptions}
                disabled={!vehicle}
              />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Data"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <FormField 
                label="Hora"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="00:00"
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <FormField 
                label="Observações"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Detalhes sobre o agendamento..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit} fullWidth={false}>
                Salvar Alterações
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}