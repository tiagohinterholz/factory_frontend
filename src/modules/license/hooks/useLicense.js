import { useEffect, useState, useCallback } from "react"
import { LicenseService } from "@/modules/license/services/license"

export function useLicense() {
  const [license, setLicense] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await LicenseService.getLicense()
      setLicense(data)
    } catch (loadError) {
      console.error("Erro ao carregar licenças:", loadError)
      setError(loadError)
      setLicense([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { license, loading, error, load }
}
