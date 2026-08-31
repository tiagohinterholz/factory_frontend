import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

// Botão "Voltar" pras telas de formulário. Sem `to`, volta uma entrada no
// histórico; com `to`, navega pra esse caminho (útil quando se entrou direto
// pela URL e não há "anterior").
export default function BackLink({ to, label = "Voltar", className = "" }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-4 ${className}`}
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  )
}
