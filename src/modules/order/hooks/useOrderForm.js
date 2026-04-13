import { useState } from "react"
import { createOrder } from "@/modules/order/services/orders"
import { useNavigate } from "react-router-dom"

export function useOrderForm() {
  const navigate = useNavigate()

  const [client, setClient] = useState("")
  const [business, setBusiness] = useState("")
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
      await createOrder(payload)
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
