import { useState } from "react"
import { createClient } from "@/modules/client/services/client"
import { useNavigate } from "react-router-dom"

export function useClientForm() {
  const navigate = useNavigate()

  const [business, setBusiness] = useState("")
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
      await createClient(payload)
      navigate("/clientes")
    } catch (error) {
      console.log(error)
      alert("Erro ao criar cliente")
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


