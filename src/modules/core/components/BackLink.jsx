import { useLocation, useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

export default function BackLink({ to, label = "Voltar", className = "" }) {
  const navigate = useNavigate()
  const location = useLocation()
  const cameFromInsideApp = location.key !== "default"

  function handleClick() {
    if (cameFromInsideApp || !to) {
      navigate(-1)
    } else {
      navigate(to)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-4 ${className}`}
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  )
}
