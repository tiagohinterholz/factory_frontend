import { useEffect, useState } from "react"
import { getUser } from "@/modules/user/services/user"

export function useUser() {
  const [user, setUser] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getUser()
        setUser(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { user, loading }
}
