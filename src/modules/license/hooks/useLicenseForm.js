import { useState, useEffect } from "react"
import { LicenseService } from "@/modules/license/services/license"
import { BusinessService } from "@/modules/business/services/business"
import { useNavigate } from "react-router-dom"

export function useLicenseForm() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  const [business, setBusiness] = useState(user.business_id || "")
  const [period, setPeriod] = useState("MENSAL")
  const [max_users, setMaxUsers] = useState("1")
  const [activation_date, setActivationDate] = useState(new Date().toISOString().split('T')[0])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBusinesses() {
      if (isSuperUser) {
        try {
          const data = await BusinessService.getBusiness()
          setBusinesses(data)
        } catch (err) {
          console.error(err)
        }
      }
      setLoading(false)
    }
    loadBusinesses()
  }, [isSuperUser])

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      period: period,
      max_users: parseInt(max_users),
      activation_date: activation_date ? new Date(activation_date).toISOString() : undefined,
    }

    try {
      await LicenseService.getLicenseRenew(business, payload)
      navigate("/empreendimentos/licencas")
    } catch (error) {
      console.log(error)
      alert("Erro ao configurar/renovar licença. Verifique se o empreendimento já possui uma base de licença.")
    }
  }

  return {
    business, setBusiness,  
    period, setPeriod,
    max_users, setMaxUsers,
    activation_date, setActivationDate,
    businesses,
    isSuperUser,
    loading,
    handleSubmit
  }
}


