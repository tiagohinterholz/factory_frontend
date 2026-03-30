import { useEffect, useState } from "react"
import { getOrder } from "@/modules/order/services/orders"

export function useOrder() {
  const [order, setOrder] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrder()
        setOrder(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { order, loading }
}
