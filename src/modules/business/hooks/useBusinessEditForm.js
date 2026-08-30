import { useState, useEffect } from "react"
import { BusinessService } from "@/modules/business/services/business"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export function useBusinessEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const [corporateName, setCorporateName] = useState("")
  const [tradeName, setTradeName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [stateId, setStateId] = useState("")
  const [cityId, setCityId] = useState("")
  const [address, setAddress] = useState("")
  const [number, setNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  const [loading, setLoading] = useState(true)

  useEffect(() => {
      async function load() {
        try {
          const data = await BusinessService.getBusinessById(id)
          setCorporateName(data.corporate_name || "")
          setTradeName(data.trade_name || "")
          setCnpj(data.cnpj || "")
          setStateId(data.state?.id || data.state || "")
          setCityId(data.city?.id || data.city || "")
          setAddress(data.address || "")
          setNumber(data.number || "")
          setComplement(data.complement || "")
          setPhone(data.phone || "")
          setEmail(data.email || "")
        } finally {
          setLoading(false)
        }
      }
      load()
    }, [id])


  async function handleUpdate(e) {
    e.preventDefault()

    const payload = {
      corporate_name: corporateName,  
      trade_name: tradeName,
      cnpj: cnpj,
      state_id: stateId,
      city_id: cityId,
      address:address,
      number: number,
      complement: complement,
      phone: phone,
      email: email
    }

    try {
      await BusinessService.updateBusiness(id, payload)
      navigate(`/empreendimentos/`)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao atualizar empreendimento").message)
    }
  }

  async function handleDelete() {
      const confirmed = await confirm({
        title: "Excluir empreendimento?",
        message: "Esta ação não pode ser desfeita.",
        confirmText: "Excluir",
        danger: true,
      })
      if (!confirmed) return
      await BusinessService.deleteBusiness(id)
      navigate("/empreendimentos")
    }

  return {
    corporateName, setCorporateName,  
    tradeName, setTradeName,
    cnpj, setCnpj,
    stateId, setStateId,
    cityId, setCityId,
    address, setAddress,
    number, setNumber,
    complement, setComplement,
    phone, setPhone,
    email, setEmail,
    loading,
    handleUpdate,
    handleDelete
  }
}
