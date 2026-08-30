import { useState, useEffect } from "react"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export function useAppointmentEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

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
        const data = await AppointmentService.getAppointmentById(id)
        setBusiness(data.business?.id || data.business || "")
        setClient(data.client?.id || data.client || "")
        setVehicle(data.vehicle?.id || data.vehicle || "")
        setDate(data.date)
        setTime(data.time)
        setObservation(data.observation)
        setOrder(data.order?.id || data.order || "")
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
      await AppointmentService.updateAppointment(id, payload)
      navigate(`/agendamentos/`)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao atualizar agendamento").message)
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir agendamento?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await AppointmentService.deleteAppointment(id)
    navigate("/agendamentos")
  }

  return {
    business,
    setBusiness,
    client,
    setClient,
    vehicle,
    setVehicle,
    date,
    setDate,
    time,
    setTime,
    observation,
    setObservation,
    order,
    setOrder,
    loading,
    handleUpdate,
    handleDelete,
  }
}
