import { useState } from "react"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"


export function useVehicleForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { businessId } = useAuth()
  
  const [business, setBusiness] = useState(businessId || "")
  const [client, setClient] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [year_model, setYearModel] = useState("")
  const [plate, setPlate] = useState("")
  const [color, setColor] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [fuel, setFuel] = useState("")
  const [mileage, setMileage] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      business_id: business,
      client_id: client,
      model: model,
      year: year,
      year_model: year_model,
      plate: plate,
      color: color,
      manufacturer: manufacturer,
      fuel: fuel,
      mileage: mileage,
    }

    try {
      await VehicleService.createVehicle(payload)
      navigate("/veiculos")
    } catch (error) {
      console.log(error)
      toast.error("Erro ao criar veículo")
    }
  }

  return {
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
  }
}


