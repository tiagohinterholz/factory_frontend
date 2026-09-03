import { Link } from "react-router-dom"
import { Plus } from "lucide-react"

export default function ListHeader({
  title,
  subtitle = "Gerencie seus registros",
  buttonText,
  buttonLink,
  actions,
}) {
  const hasButton = buttonText && buttonLink

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl font-semibold text-ink tracking-tight">{title}</h1>
        <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>
      </div>

      {(actions || hasButton) && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {hasButton && (
            <Link to={buttonLink} className="btn-primary">
              <Plus className="w-4 h-4" />
              <span>{buttonText}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
