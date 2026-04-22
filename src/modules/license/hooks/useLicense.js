import { useEffect, useState } from "react"
import { LicenseService } from "@/modules/license/services/license"

export function useLicense() {
  const [license, setLicense] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await LicenseService.getLicense()
        setLicense(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { license, loading }
}
