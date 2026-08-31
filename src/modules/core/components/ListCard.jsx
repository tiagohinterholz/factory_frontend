import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export default function ListCard({ to, title, subtitle }) {
  return (
    <Link
      to={to}
      className="card-premium group flex items-center justify-between hover:border-brand/30"
    >
      <div className="flex flex-col">
        <p className="font-medium text-ink group-hover:text-brand transition-colors">{title}</p>
        {subtitle && <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>}
      </div>

      <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand transition-colors" />
    </Link>
  )
}
