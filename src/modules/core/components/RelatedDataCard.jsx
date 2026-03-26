import { Link } from "react-router-dom"
import { ChevronRight, PlusCircle } from "lucide-react"

export default function RelatedDataCard({ 
  title, 
  items = [], 
  loading = false, 
  emptyMessage = "Nenhum registro encontrado.",
  icon: Icon,
  viewAllLink,
  onAddClick,
  renderItem
}) {
  return (
    <div className="card-premium h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
        </div>

        {onAddClick && (
          <button 
            onClick={onAddClick}
            className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition duration-300"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
        {loading ? (
          <div className="py-10 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400 font-medium">Carregando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400 font-medium italic px-4">{emptyMessage}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id || index}>
              {renderItem ? renderItem(item) : (
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between group transition duration-300 hover:bg-white hover:border-indigo-100 hover:shadow-sm">
                   <div>
                      <p className="font-bold text-slate-700 text-sm">{item.name || item.title || "Registro"}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{item.subtitle || ""}</p>
                   </div>
                   <div className="text-slate-300 group-hover:text-indigo-600 transition duration-300">
                      <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {viewAllLink && items.length > 0 && (
        <Link 
          to={viewAllLink}
          className="mt-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition duration-300 py-2 border-t border-slate-50 pt-4"
        >
          Ver Todos os Registros
        </Link>
      )}
    </div>
  )
}
