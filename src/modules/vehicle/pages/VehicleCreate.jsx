import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useVehicleForm } from "@/modules/vehicle/hooks/useVehicleForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { fuelOptions } from "../constants/vehicle"


export default function VehicleCreate() {
  const location = useLocation()
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
    handleSubmit
  } = useVehicleForm()

  useEffect(() => {
    if (location.state?.clientId) {
      setClient(location.state.clientId)
    }
  }, [location.state, setClient])
  
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

  if (loadingBusinesses || loadingClients) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Novo Veículo</h1>
        <p className="text-slate-400 font-medium text-sm mb-8 uppercase tracking-[0.15em]">Cadastre as informações técnicas do veículo</p>

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
              />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Fabricante"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Ex: Toyota"
              />
              <FormField 
                label="Modelo"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: Corolla"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Ano de Fabricação"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2023"
              />
              <FormField 
                label="Ano do Modelo"
                value={year_model}
                onChange={(e) => setYearModel(e.target.value)}
                placeholder="2024"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Placa"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="ABC-1234"
              />
              <FormField 
                label="Cor"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Prata"
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
                placeholder="0"
              />
            </div>

            <div className="pt-4">
              <PrimaryButton type="submit">
                Salvar Veículo
              </PrimaryButton>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
