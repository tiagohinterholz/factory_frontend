import { useState } from "react"
import { OrderService } from "@/modules/order/services/order"
import { useNavigate } from "react-router-dom"

export function useOrderForm() {
  const navigate = useNavigate()

  const [business, setBusiness] = useState(() => {
    const userStr = localStorage.getItem("user") || "{}"
    const loggedUser = JSON.parse(userStr)
    return loggedUser.business_id || ""
  })
  const [client, setClient] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [serviceDate, setServiceDate] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      client_id: client,
      business_id: business,
      vehicle_id: vehicle,
      service_date: serviceDate || null,
      notes: notes
    }

    try {
      await OrderService.createOrder(payload)
      navigate("/ordens")
    } catch (error) {
      console.log(error)
      alert("Erro ao criar ordem")
    }
  }

  return {
    business, setBusiness,
    client, setClient,
    vehicle, setVehicle,
    serviceDate, setServiceDate,
    notes, setNotes,
    handleSubmit
  }
}
