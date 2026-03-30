import { useEffect, useState } from "react"
import { getAppointment } from "@/modules/appointment/services/appointment"

export function useAppointment() {
  const [appointment, setAppointment] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAppointment()
        setAppointment(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { appointment, loading }
}
