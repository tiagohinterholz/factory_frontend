import { useState } from "react"
import { ProductService } from "@/modules/product/services/product"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

export function useProductForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const location = useLocation()
  const { businessId } = useAuth()

  const [business, setBusiness] = useState(businessId || "")
  const [supplier, setSupplier] = useState(location.state?.supplierId || "")  
  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [reference, setReference] = useState("")
  const [description, setDescription] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      business_id: business,
      supplier_id: supplier,  
      name: name,
      brand: brand,
      reference: reference,
      description: description,
      stock_quantity: stockQuantity,
      unit_price: unitPrice,
    }

    try {
      await ProductService.createProduct(payload)
      navigate("/produtos")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao criar produto").message)
    }
  }

  return {
    business, setBusiness,
    supplier, setSupplier,  
    name, setName,
    brand, setBrand,
    reference, setReference,
    description, setDescription,
    stockQuantity, setStockQuantity,
    unitPrice, setUnitPrice,
    handleSubmit
  }
}


