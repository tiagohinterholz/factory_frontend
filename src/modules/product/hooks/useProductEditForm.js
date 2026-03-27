import { useState, useEffect } from "react"
import { updateProduct, getProductById, deleteProduct } from "@/modules/product/services/product"
import { useNavigate, useParams } from "react-router-dom"

export function useProductEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [business, setBusiness] = useState("")
  const [supplier, setSupplier] = useState("")
  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [reference, setReference] = useState("")
  const [description, setDescription] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")

  const [loading, setLoading] = useState(true)

  useEffect(() => {
      async function load() {
        try {
          const data = await getProductById(id)
          setBusiness(data.business)
          setSupplier(data.supplier)
          setName(data.name)
          setBrand(data.brand)
          setReference(data.reference)
          setDescription(data.description)
          setStockQuantity(data.stock_quantity)
          setUnitPrice(data.unit_price)
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
      brand: brand,
      reference: reference,
      description: description,
      stock_quantity: stockQuantity,
      unit_price: unitPrice,
    }

    try {
      await updateProduct(id, payload)
      navigate(`/produtos/`)
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar Produto")
    }
  }

  async function handleDelete() {
      if (!confirm("Deseja realmente deletar?")) return
      await deleteProduct(id)
      navigate("/produtos")
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
    loading,
    handleUpdate,
    handleDelete
  }
}
