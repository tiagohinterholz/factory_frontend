import { useState } from "react"
import { BusinessService } from "@/modules/business/services/business"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

export function useBusinessForm() {
  const navigate = useNavigate()
  const toast = useToast()

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

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      corporate_name: corporateName,
      trade_name: tradeName,
      cnpj: cnpj,
      state_id: stateId,
      city_id: cityId,
      address: address,
      number: number,
      complement: complement,
      phone: phone,
      email: email,
    }

    try {
      await BusinessService.createBusiness(payload)
      navigate("/empreendimentos")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao criar empreendimento").message)
    }
  }

  return {
    corporateName,
    setCorporateName,
    tradeName,
    setTradeName,
    cnpj,
    setCnpj,
    stateId,
    setStateId,
    cityId,
    setCityId,
    address,
    setAddress,
    number,
    setNumber,
    complement,
    setComplement,
    phone,
    setPhone,
    email,
    setEmail,
    handleSubmit,
  }
}
