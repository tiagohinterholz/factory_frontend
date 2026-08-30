import { useState } from "react"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

export function useAppointmentForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { businessId } = useAuth()

  const [business, setBusiness] = useState(businessId || "")
  const [client, setClient] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [observation, setObservation] = useState("")
  const [order, setOrder] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      business_id: business,
      client_id: client,
      vehicle_id: vehicle,
      date: date,
      time: time,
      observation: observation,
      order_id: order || null,
    }

    try {
      await AppointmentService.createAppointment(payload)
      navigate("/agendamentos")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao criar agendamento").message)
    }
  }

  return {
    business, setBusiness,
    client, setClient,  
    vehicle, setVehicle,
    date, setDate,
    time, setTime,
    observation, setObservation,
    order, setOrder,
    handleSubmit
  }
}


