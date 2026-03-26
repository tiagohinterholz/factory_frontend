import { useEffect, useState } from "react"
import { getClient } from "@/modules/client/services/client"

export function useClient() {
  const [client, setClient] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getClient()
        setClient(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { client, loading }
}
