import { useState, useEffect } from "react"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { useNavigate, useParams } from "react-router-dom"

export function useVehicleEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [business, setBusiness] = useState("")
  const [client, setClient] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [year_model, setYearModel] = useState("")
  const [plate, setPlate] = useState("")
  const [color, setColor] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [fuel, setFuel] = useState("")
  const [mileage, setMileage] = useState("")

  const [loading, setLoading] = useState(true)

  useEffect(() => {
      async function load() {
        try {
          const data = await VehicleService.getVehicleById(id)
          setBusiness(data.business?.id || data.business || "")
          setClient(data.client?.id || data.client || "")
          setModel(data.model || "")
          setYear(data.year || "")
          setYearModel(data.year_model || "")
          setPlate(data.plate || "")
          setColor(data.color || "")
          setManufacturer(data.manufacturer || "")
          setFuel(data.fuel || "")
          setMileage(data.mileage || "")
        } finally {
          setLoading(false)
        }
      }
      load()
    }, [id])


  async function handleUpdate(e) {
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
      await VehicleService.updateVehicle(id, payload)
      navigate(`/veiculos/`)
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar veiculo")
    }
  }

  async function handleDelete() {
    if (!confirm("Deseja realmente deletar?")) return
    await VehicleService.deleteVehicle(id)
    navigate("/veiculos")
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
    loading,
    handleUpdate,
    handleDelete
  }
}
