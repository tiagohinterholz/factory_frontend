import { useVehicleEditForm } from "@/modules/vehicle/hooks/useVehicleEditForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { fuelOptions } from "../constants/vehicle"


import { Edit, Trash2 } from "lucide-react"


export default function VehicleEdit() {
  const {
    business, setBusiness,
    client, setClient,
    model, setModel,
    year, setYear,
    year_model, setYearModel,
    plate, setPlate,
    color, setColor,
    manufacturer, setManufacturer,
    fuel, setFuel,
    mileage, setMileage,
    loading,
    handleUpdate,
    handleDelete
  } = useVehicleEditForm()
  
  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const { client: clients, loading: loadingClients } = useClient()

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  const businessOptions = businesses.map(b => ({
    id: b.id,
    name: b.corporate_name
  }))
  const clientOptions = clients.map(c => ({
    id: c.id,
    name: c.first_name + " " + c.last_name
  }))

  if (loading || loadingBusinesses || loadingClients) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Editar Veículo</h1>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">Sincronize os dados técnicos</p>
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
              />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Fabricante"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
              <FormField 
                label="Modelo"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Ano de Fabricação"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <FormField 
                label="Ano do Modelo"
                value={year_model}
                onChange={(e) => setYearModel(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Placa"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
              />
              <FormField 
                label="Cor"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                label="Combustível"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                options={fuelOptions}
              />
              <FormField 
                label="Quilometragem"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
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
