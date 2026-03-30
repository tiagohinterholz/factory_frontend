import { useEffect, useState } from "react"
import { getCities } from "@/modules/location/city/services/city"
import { getCitiesByState } from "@/modules/location/state/services/state"

export function useCities() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getCities()
      const sorted = data.sort((a, b) => 
        a.state.name.localeCompare(b.state.name)
      )
      setCities(sorted)
      setLoading(false)
    }
    load()
  }, [])

  return { cities, loading }
}

export function useCitiesByState(stateId) {
  const [citiesByState, setCitiesByState] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!stateId) return

    async function load() {
      setLoading(true)
      const data = await getCitiesByState(stateId)
      const sorted = data.sort((a, b) => 
        a.name.localeCompare(b.name)
      )
      setCitiesByState(sorted)
      setLoading(false)
    }
    load()
  }, [stateId])

  return { citiesByState, loading }
}