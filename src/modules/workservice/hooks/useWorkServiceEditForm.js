import { useState, useEffect } from "react"
import { WorkService } from "@/modules/workservice/services/workservice"
import { useNavigate, useParams } from "react-router-dom"

export function useWorkServiceEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [business, setBusiness] = useState("")
  const [supplier, setSupplier] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [unitPrice, setUnitPrice] = useState("")

  const [loading, setLoading] = useState(true)

  useEffect(() => {
      async function load() {
        try {
          const data = await WorkService.getWorkServiceById(id)
          setBusiness(data.business?.id || data.business || "")
          setSupplier(data.supplier?.id || data.supplier || "")
          setName(data.name || "")
          setDescription(data.description || "")
          setUnitPrice(data.unit_price || "")
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
      supplier_id: supplier,  
      name: name,
      description: description,
      unit_price: unitPrice,
    }

    try {
      await WorkService.updateWorkService(id, payload)
      navigate(`/servicos/`)
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar serviço")
    }
  }

  async function handleDelete() {
      if (!confirm("Deseja realmente deletar?")) return
      await WorkService.deleteWorkService(id)
      navigate("/servicos")
    }

  return {
    business, setBusiness,
    supplier, setSupplier,  
    name, setName,
    description, setDescription,
    unitPrice, setUnitPrice,
    loading,
    handleUpdate,
    handleDelete
  }
}
