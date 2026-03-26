import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export default function ListCard({ to, title, subtitle }) {
  return (
    <Link 
      to={to}
      className="card-premium group flex items-center justify-between hover:border-indigo-100 hover:bg-slate-50/50"
    >
      <div className="flex flex-col">
        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition duration-300">{title}</p>
        {subtitle && (
          <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-sm border border-slate-100">
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  )
}
