import { useState, useEffect } from "react"
import { updateBusiness, getBusinessById, deleteBusiness } from "@/modules/business/services/business"
import { useNavigate, useParams } from "react-router-dom"

export function useBusinessEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

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
          const data = await getBusinessById(id)
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
      await updateBusiness(id, payload)
      navigate(`/empreendimentos/`)
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar empreendimento")
    }
  }

  async function handleDelete() {
      if (!confirm("Deseja realmente deletar?")) return
      await deleteBusiness(id)
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
