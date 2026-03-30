import { useState } from "react"
import { createAppointment } from "@/modules/appointment/services/appointment"
import { useNavigate } from "react-router-dom"

export function useAppointmentForm() {
  const navigate = useNavigate()

  const [business, setBusiness] = useState("")
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
      order_id: order,
    }

    try {
      await createAppointment(payload)
      navigate("/agendamentos")
    } catch (error) {
      console.log(error)
      alert("Erro ao criar agendamento")
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


