import { useState, useEffect } from "react"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export function useSupplierEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const [business, setBusiness] = useState("")
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
        const data = await SupplierService.getSupplierById(id)
        setBusiness(data.business)
        setCorporateName(data.corporate_name)
        setTradeName(data.trade_name)
        setCnpj(data.cnpj)
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
      await SupplierService.updateSupplier(id, payload)
      navigate(`/fornecedores/`)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao atualizar fornecedor").message)
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir fornecedor?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await SupplierService.deleteSupplier(id)
    navigate("/fornecedores")
  }

  return {
    business,
    setBusiness,
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
    loading,
    handleUpdate,
    handleDelete,
  }
}
