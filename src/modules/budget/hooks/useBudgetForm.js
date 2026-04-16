import { useState } from "react"
import { createBudget } from "@/modules/budget/services/budgets"
import { useNavigate } from "react-router-dom"

export function useBudgetForm() {
  const navigate = useNavigate()

  const [client, setClient] = useState("")
  const [business, setBusiness] = useState(() => {
    const userStr = localStorage.getItem("user") || "{}"
    const loggedUser = JSON.parse(userStr)
    return loggedUser.business_id || ""
  })
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
      await createBudget(payload)
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


