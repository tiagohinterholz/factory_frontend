import { useState } from "react"
import { OrderService } from "@/modules/order/services/order"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

export function useOrderForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { businessId } = useAuth()

  const [business, setBusiness] = useState(businessId || "")
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
      notes: notes,
    }

    try {
      await OrderService.createOrder(payload)
      navigate("/ordens")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao criar ordem").message)
    }
  }

  return {
    business,
    setBusiness,
    client,
    setClient,
    vehicle,
    setVehicle,
    serviceDate,
    setServiceDate,
    notes,
    setNotes,
    handleSubmit,
  }
}
