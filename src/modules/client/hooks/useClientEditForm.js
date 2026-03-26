import { useState, useEffect } from "react"
import { updateClient, getClientById, deleteClient } from "@/modules/client/services/client"
import { useNavigate, useParams } from "react-router-dom"

export function useClientEditForm() {
  const { id } = useParams()
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

  const [loading, setLoading] = useState(true)

  useEffect(() => {
      async function load() {
        try {
          const data = await getClientById(id)
          setBusiness(data.business)
          setFirstName(data.first_name)
          setLastName(data.last_name)
          setCpf(data.cpf)
          setStateId(data.state.id || "")
          setCityId(data.city.id || "")
          setAddress(data.address)
          setNumber(data.number)
          setComplement(data.complement)
          setPhone(data.phone)
          setEmail(data.email)
        } finally {
          setLoading(false)
        }
      }
      load()
    }, [id])


  async function handleUpdate(e) {
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
      await updateClient(id, payload)
      navigate(`/clientes/`)
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar cliente")
    }
  }

  async function handleDelete() {
      if (!confirm("Deseja realmente deletar?")) return
      await deleteClient(id)
      navigate("/clientes")
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
    loading,
    handleUpdate,
    handleDelete
  }
}
