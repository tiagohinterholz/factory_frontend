import { useEffect, useState } from "react"
import { BusinessService } from "@/modules/business/services/business"

// Logo do próprio negócio: /configuracoes/logo/ devolve o binário direto
// (não JSON), então precisa buscar como blob e virar object URL — mesma
// ideia do preview de arquivo novo em LogoUploadField. 404 (sem logo) e 400
// (superusuário) resolvem pra "sem imagem", sem toast — tela não trata isso
// como erro visível, só mostra o placeholder.
export function useBusinessLogo() {
  const [logoUrl, setLogoUrl] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    let objectUrl = ""

    BusinessService.getSelfLogo()
      .then((blob) => {
        if (!alive) return
        objectUrl = URL.createObjectURL(blob)
        setLogoUrl(objectUrl)
      })
      .catch(() => {
        if (alive) setLogoUrl("")
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  return { logoUrl, loading }
}
