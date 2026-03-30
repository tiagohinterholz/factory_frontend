import { useState, useEffect } from "react"
import { updateAppointment, getAppointmentById, deleteAppointment } from "@/modules/appointment/services/appointment"
import { useNavigate, useParams } from "react-router-dom"

export function useAppointmentEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [business, setBusiness] = useState("")
  const [client, setClient] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [observation, setObservation] = useState("")
  const [order, setOrder] = useState("")

  const [loading, setLoading] = useState(true)

  useEffect(() => {
      async function load() {
        try {
          const data = await getAppointmentById(id)
          setBusiness(data.business)
          setClient(data.client)
          setVehicle(data.vehicle)
          setDate(data.date)
          setTime(data.time)
          setObservation(data.observation)
          setOrder(data.order)
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
      vehicle_id: vehicle,
      date: date,
      time: time,
      observation: observation,
      order_id: order,
    }

    try {
      await updateAppointment(id, payload)
      navigate(`/agendamentos/`)
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar agendamento")
    }
  }

  async function handleDelete() {
    if (!confirm("Deseja realmente deletar?")) return
    await deleteAppointment(id)
    navigate("/agendamentos")
  }

  return {
    business, setBusiness,
    client, setClient,  
    vehicle, setVehicle,
    date, setDate,
    time, setTime,
    observation, setObservation,
    order, setOrder,
    loading,
    handleUpdate,
    handleDelete
  }
}
