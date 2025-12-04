import { useEffect, useState } from "react"
import { getStates } from "@/modules/location/state/services/state"

export function useStates() {
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getStates()
      const sorted = data.sort((a, b) =>
        a.name.localeCompare(b.name)
      )
      setStates(sorted)
      setLoading(false)
    }
    load()
  }, [])

  return { states, loading }
}
