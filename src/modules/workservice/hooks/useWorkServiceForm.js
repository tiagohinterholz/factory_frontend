import { useState } from "react"
import { createWorkService } from "@/modules/workservice/services/workservice"
import { useNavigate, useLocation } from "react-router-dom"

export function useWorkServiceForm() {
  const navigate = useNavigate()
  const location = useLocation()

  const [business, setBusiness] = useState(() => {
    const userStr = localStorage.getItem("user") || "{}"
    const loggedUser = JSON.parse(userStr)
    return loggedUser.business_id || ""
  })
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
      await createWorkService(payload)
      navigate("/servicos")
    } catch (error) {
      console.log(error)
      alert("Erro ao criar serviço")
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


