import { useState, useEffect, useCallback } from "react"
import { OrderService } from "@/modules/order/services/order"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export function useOrderEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const [client, setClient] = useState("")
  const [business, setBusiness] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [budget, setBudget] = useState("")
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [serviceDate, setServiceDate] = useState("")
  const [billingDate, setBillingDate] = useState("")
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [total, setTotal] = useState("")

  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await OrderService.getOrderById(id)
      setBusiness(data.business?.id || data.business)
      setClient(data.client?.id || data.client)
      setVehicle(data.vehicle?.id || data.vehicle)
      setBudget(data.budget?.id || data.budget)
      setProducts(data.order_products || [])
      setServices(data.order_services || [])

      if (data.service_date) setServiceDate(data.service_date.slice(0, 10))
      if (data.billing_date) setBillingDate(data.billing_date.slice(0, 10))

      setStatus(data.status)
      setNotes(data.notes)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleUpdate(e) {
    e.preventDefault()

    const payload = {
      business_id: business || null,
      client_id: client || null,
      vehicle_id: vehicle || null,
      budget_id: budget || null,
      service_date: serviceDate || null,
      billing_date: billingDate || null,
      status: status,
      notes: notes || null,
    }

    try {
      await OrderService.updateOrder(id, payload)
      navigate(`/ordens/`)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao atualizar a ordem de serviço").message)
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir ordem de serviço?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await OrderService.deleteOrder(id)
    navigate("/ordens")
  }

  async function handleInvoice() {
    const confirmed = await confirm({
      title: "Faturar ordem de serviço?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Faturar",
    })
    if (!confirmed) return
    try {
      await OrderService.invoiceOrder(id)
      load()
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao faturar a ordem de serviço").message)
    }
  }

  return {
    business,
    setBusiness,
    client,
    setClient,
    vehicle,
    setVehicle,
    budget,
    setBudget,
    products,
    setProducts,
    services,
    setServices,
    serviceDate,
    setServiceDate,
    billingDate,
    setBillingDate,
    status,
    setStatus,
    notes,
    setNotes,
    total,
    setTotal,
    loading,
    handleUpdate,
    handleDelete,
    handleInvoice,
    refresh: load,
  }
}
