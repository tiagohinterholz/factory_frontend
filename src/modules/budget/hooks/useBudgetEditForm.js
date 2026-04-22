import { useState, useEffect, useCallback } from "react"
import { BudgetService } from "@/modules/budget/services/budgets"
import { useNavigate, useParams } from "react-router-dom"

export function useBudgetEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [client, setClient] = useState("")
  const [business, setBusiness] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [validUntil, setValidUntil] = useState("")
  const [status, setStatus] = useState("")
  const [total, setTotal] = useState("")

  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await BudgetService.getBudgetById(id)
      setBusiness(data.business?.id || data.business || "")
      setClient(data.client?.id || data.client || "")
      setVehicle(data.vehicle?.id || data.vehicle || "")
      setProducts(data.budget_products || [])
      setServices(data.budget_services || [])
      
      if (data.valid_until) {
        setValidUntil(data.valid_until.slice(0, 10))
      }
      
      setStatus(data.status || "")
      setTotal(data.total || "0.00")
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
      valid_until: validUntil || null,
    }

    try {
      await BudgetService.updateBudget(id, payload)
      navigate(`/orcamentos/`)
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar")
    }
  }

  async function handleDelete() {
    if (!confirm("Deseja realmente deletar?")) return
    await BudgetService.deleteBudget(id)
    navigate("/orcamentos")
  }

  async function handleApprove() {
    if (!confirm("Deseja aprovar este orçamento? Isso pode gerar uma Ordem de Serviço.")) return
    try {
      await BudgetService.approveBudget(id)
      refresh()
      alert("Orçamento aprovado com sucesso!")
    } catch (error) {
      console.error(error)
      alert("Erro ao aprovar orçamento")
    }
  }

  async function handleCancel() {
    if (!confirm("Deseja cancelar este orçamento?")) return
    try {
      await BudgetService.cancelBudget(id)
      refresh()
    } catch (error) {
      console.error(error)
      alert("Erro ao cancelar orçamento")
    }
  }

  const refresh = load

  return {
    business, setBusiness,
    client, setClient,  
    vehicle, setVehicle,
    products, setProducts,
    services, setServices,
    validUntil, setValidUntil,
    status, setStatus,
    total, setTotal,
    loading,
    handleUpdate,
    handleDelete,
    handleApprove,
    handleCancel,
    refresh
  }
}
