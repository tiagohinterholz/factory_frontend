import { useState, useEffect } from "react"
import { getLicenseRenew, getLicenseById } from "@/modules/license/services/license"
import { useNavigate, useParams } from "react-router-dom"

export function useLicenseEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [business, setBusiness] = useState(null)
  const [status, setStatus] = useState("")
  const [period, setPeriod] = useState("MENSAL")
  const [max_users, setMaxUsers] = useState("1")
  const [activation_date, setActivationDate] = useState("")
  const [expiration_date, setExpirationDate] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getLicenseById(id)
        setBusiness(data.business)
        setStatus(data.status)
        setPeriod(data.period)
        setMaxUsers(data.max_users.toString())
        setActivationDate(data.activation_date)
        setExpirationDate(data.expiration_date)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleRenewSubmit(e) {
    e.preventDefault()
    const payload = {
      period: period,
      max_users: parseInt(max_users),
      activation_date: activation_date ? new Date(activation_date).toISOString() : undefined,
    }

    try {
      // Usamos o business_id (pode ser objeto carregado ou string do combo)
      const businessIdToRenew = business?.id || business
      await getLicenseRenew(businessIdToRenew, payload)
      navigate(`/empreendimentos/licencas`)
    } catch (error) {
      console.log(error)
      alert("Erro ao processar renovação")
    }
  }

  return {
    business, setBusiness,
    status,
    period, setPeriod,
    max_users, setMaxUsers,
    activation_date, setActivationDate,
    expiration_date,
    loading,
    handleRenewSubmit
  }
}
