import { useEffect, useState } from "react"
import { getBusiness } from "@/modules/business/services/business"

export function useBusiness() {
  const [business, setBusiness] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getBusiness()
        setBusiness(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { business, loading }
}
