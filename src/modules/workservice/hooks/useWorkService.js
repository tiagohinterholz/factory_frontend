import { useEffect, useState } from "react"
import { getWorkService } from "@/modules/workservice/services/workservice"

export function useWorkService() {
  const [workservice, setWorkService] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getWorkService()
        setWorkService(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { workservice, loading }
}
