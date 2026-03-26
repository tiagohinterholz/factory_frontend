import { Link } from "react-router-dom"
import { Plus } from "lucide-react"

export default function ListHeader({ title, buttonText, buttonLink }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-[0.15em]">Gerencie seus registros e dados</p>
      </div>

      <Link 
        to={buttonLink}
        className="btn-primary group !py-3 !px-6"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition duration-500" />
        <span className="font-bold">{buttonText}</span>
      </Link>
    </div>
  )
}