import { useState, useEffect, useCallback } from "react"
import { updateOrder, getOrderById, deleteOrder, invoiceOrder } from "@/modules/order/services/orders"
import { useNavigate, useParams } from "react-router-dom"

export function useOrderEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

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
      const data = await getOrderById(id)
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

    console.log("Enviando PATCH para OS:", id, payload)

    try {
      await updateOrder(id, payload)
      navigate(`/ordens/`)
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar")
    }
  }

  async function handleDelete() {
    if (!confirm("Deseja realmente deletar?")) return
    await deleteOrder(id)
    navigate("/ordens")
  }

  async function handleInvoice() {
    if (!confirm("Deseja faturar esta Ordem de Serviço? Esta ação não pode ser desfeita.")) return
    try {
      await invoiceOrder(id)
      load()
    } catch (error) {
      console.error(error)
      alert("Erro ao faturar a OS")
    }
  }

  return {
    business, setBusiness,
    client, setClient,  
    vehicle, setVehicle,
    budget, setBudget,
    products, setProducts,
    services, setServices,
    serviceDate, setServiceDate,
    billingDate, setBillingDate,
    status, setStatus,
    notes, setNotes,
    total, setTotal,
    loading,
    handleUpdate,
    handleDelete,
    handleInvoice,
    refresh: load
  }
}
