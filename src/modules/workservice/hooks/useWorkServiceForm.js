import { useState } from "react"
import { WorkService } from "@/modules/workservice/services/workservice"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"


export function useWorkServiceForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const location = useLocation()
  const { businessId } = useAuth()

  const [business, setBusiness] = useState(businessId || "")
  const [supplier, setSupplier] = useState(location.state?.supplierId || "")  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [unitPrice, setUnitPrice] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      business_id: business,
      supplier_id: supplier,  
      name: name,
      description: description,
      unit_price: unitPrice,
    }

    try {
      await WorkService.createWorkService(payload)
      navigate("/servicos")
    } catch (error) {
      console.log(error)
      toast.error("Erro ao criar serviço")
    }
  }

  return {
    business, setBusiness,
    supplier, setSupplier,  
    name, setName,
    description, setDescription,
    unitPrice, setUnitPrice,
    handleSubmit
  }
}


