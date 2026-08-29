import { useState } from "react"
import { BudgetService } from "@/modules/budget/services/budgets"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"

export function useBudgetForm() {
  const navigate = useNavigate()
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
      console.log(error)
      alert("Erro ao criar orçamento")
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


