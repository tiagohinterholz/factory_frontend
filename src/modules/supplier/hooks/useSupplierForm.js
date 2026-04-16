import { useState } from "react"
import { createSupplier } from "@/modules/supplier/services/supplier"
import { useNavigate } from "react-router-dom"

export function useSupplierForm() {
  const navigate = useNavigate()

  const [business, setBusiness] = useState(() => {
    const userStr = localStorage.getItem("user") || "{}"
    const loggedUser = JSON.parse(userStr)
    return loggedUser.business_id || ""
  })
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
      business_id: business,
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
      await createSupplier(payload)
      navigate("/fornecedores")
    } catch (error) {
      console.log(error)
      alert("Erro ao criar fornecedor")
    }
  }

  return {
    business, setBusiness,
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
    handleSubmit
  }
}


