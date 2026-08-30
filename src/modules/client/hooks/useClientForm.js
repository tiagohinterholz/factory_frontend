import { useState } from "react"
import { ClientService } from "@/modules/client/services/client"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

export function useClientForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { businessId } = useAuth()

  const [business, setBusiness] = useState(businessId || "")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [cpf, setCpf] = useState("")
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
      business_id: business,
      first_name: firstName,  
      last_name: lastName,
      cpf: cpf,
      state_id: stateId,
      city_id: cityId,
      address:address,
      number: number,
      complement: complement,
      phone: phone,
      email: email
    }

    try {
      await ClientService.createClient(payload)
      navigate("/clientes")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao criar cliente. Verifique se os dados estão corretos.").message)
    }
  }

  return {
    business, setBusiness,
    firstName, setFirstName,  
    lastName, setLastName,
    cpf, setCpf,
    stateId, setStateId,
    cityId, setCityId,
    address, setAddress,
    number, setNumber,
    complement, setComplement,
    phone, setPhone,
    email, setEmail,
    handleSubmit
  }
}


