import { useBudgetForm } from "@/modules/budget/hooks/useBudgetForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import { useVehicle } from "@/modules/vehicle/hooks/useVehicle"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function BudgetCreate() {
  const {
    business, setBusiness,
    client, setClient,
    vehicle, setVehicle,
    validUntil, setValidUntil,
    handleSubmit
  } = useBudgetForm()
  
  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const { client: clients, loading: loadingClients } = useClient()
  const { vehicle: vehicles, loading: loadingVehicles } = useVehicle()

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  const businessOptions = businesses.map(b => ({ id: b.id, name: b.corporate_name }))
  const clientOptions = clients
    .filter(c => !business || (c.business?.id || c.business) === parseInt(business))
    .map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}` }))
  const vehicleOptions = vehicles
    .filter(v => !client || (v.client?.id || v.client) === parseInt(client))
    .map(v => ({ id: v.id, name: `${v.manufacturer} ${v.model} (${v.plate})` }))

  if (loadingBusinesses || loadingClients || loadingVehicles) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Novo Orçamento</h1>
        <p className="text-slate-400 font-medium text-sm mb-8 uppercase tracking-[0.15em]">Crie a estrutura básica do orçamento</p>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSuperUser &&
              <SelectField 
                label="Empreendimento"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                options={businessOptions}
                required
              />
           }
            <SelectField 
              label="Cliente"
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
            <FormField 
              label="Validade"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
            <div className="pt-4">
              <PrimaryButton type="submit">Prosseguir para Itens</PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
