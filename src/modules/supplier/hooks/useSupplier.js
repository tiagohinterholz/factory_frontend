import { useEffect, useState } from "react"
import { getSupplier } from "@/modules/supplier/services/supplier"

export function useSupplier() {
  const [supplier, setSupplier] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSupplier()
        setSupplier(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { supplier, loading }
}
