import { useState } from "react"
import { BudgetService } from "@/modules/budget/services/budgets"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

export function useBudgetForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { businessId } = useAuth()

  const [client, setClient] = useState("")
  const [business, setBusiness] = useState(businessId || "")
  const [vehicle, setVehicle] = useState("")
  const [validUntil, setValidUntil] = useState("")


  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      client_id: client,
      business_id: business,
      vehicle_id: vehicle,
      valid_until: validUntil || null,
    }

    try {
      await BudgetService.createBudget(payload)
      navigate("/orcamentos")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao criar orçamento").message)
    }
  }

  return {
    business, setBusiness,
    client, setClient,
    vehicle, setVehicle,
    validUntil, setValidUntil,
    handleSubmit
  }
}


