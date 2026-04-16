import { useAppointmentForm } from "@/modules/appointment/hooks/useAppointmentForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import { useVehicle } from "@/modules/vehicle/hooks/useVehicle"
import { useOrder } from "@/modules/order/hooks/useOrder"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useEffect } from "react"


export default function AppointmentCreate() {
  const {
    business, setBusiness,
    client, setClient,
    vehicle, setVehicle,
    date, setDate,
    time, setTime,
    observation, setObservation,
    order, setOrder,
    handleSubmit
  } = useAppointmentForm()
  
  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const { client: clients, loading: loadingClients } = useClient()
  const { vehicle: vehicles, loading: loadingVehicles } = useVehicle()
  const { orders, loading: loadingOrders } = useOrder()

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  useEffect(() => {
    if (isSuperUser) {
        setClient("")
        setVehicle("")
        setOrder("")
    }
  }, [business, isSuperUser, setClient, setVehicle, setOrder])

  useEffect(() => {
    setVehicle("")
    setOrder("")
  }, [client, setVehicle, setOrder])

  useEffect(() => {
    setOrder("")
  }, [vehicle, setOrder])

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

  if (loadingBusinesses || loadingClients || loadingVehicles || loadingOrders) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Novo Agendamento</h1>
        <p className="text-slate-400 font-medium text-sm mb-8 uppercase tracking-[0.15em]">Agende um horário para atendimento</p>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={handleSubmit}>

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

            <div className="pt-4">
              <PrimaryButton type="submit">
                Salvar Agendamento
              </PrimaryButton>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
