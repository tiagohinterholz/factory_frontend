import { useEffect, useState } from "react"
import { getProduct } from "@/modules/product/services/product"

export function useProduct() {
  const [product, setProduct] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getProduct()
        setProduct(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { product, loading }
}
