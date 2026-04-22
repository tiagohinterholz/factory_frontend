import { useState } from "react"
import { ProductService } from "@/modules/product/services/product"
import { useNavigate, useLocation } from "react-router-dom"

export function useProductForm() {
  const navigate = useNavigate()
  const location = useLocation()

  const [business, setBusiness] = useState(() => {
    const userStr = localStorage.getItem("user") || "{}"
    const loggedUser = JSON.parse(userStr)
    return loggedUser.business_id || ""
  })
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
      console.log(error)
      alert("Erro ao criar produto")
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


