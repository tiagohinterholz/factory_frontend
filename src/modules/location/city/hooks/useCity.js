import { useEffect, useState } from "react"
import { getCities } from "@/modules/location/city/services/city"
import { getCitiesByState } from "@/modules/location/city/services/city"

export function useCities() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    async function load() {
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!stateId) return
    
    setLoading(true)

    async function load() {
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