import { useEffect, useState } from "react"
import { getVehicle } from "@/modules/vehicle/services/vehicle"

export function useVehicle() {
  const [vehicle, setVehicle] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getVehicle()
        setVehicle(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { vehicle, loading }
}
