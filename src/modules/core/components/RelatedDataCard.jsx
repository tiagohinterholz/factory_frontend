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
  renderItem,
}) {
  return (
    <div className="card-premium h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-9 h-9 bg-ground rounded-lg flex items-center justify-center text-brand border border-line">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h3 className="font-semibold text-ink">{title}</h3>
        </div>

        {onAddClick && (
          <button
            onClick={onAddClick}
            className="w-8 h-8 rounded-lg bg-brand-subtle text-brand flex items-center justify-center hover:bg-brand hover:text-brand-fg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin">
        {loading ? (
          <div className="py-10 text-center">
            <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-[13px] text-muted">Carregando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center bg-ground rounded-lg border border-dashed border-line">
            <p className="text-[13px] text-muted px-4">{emptyMessage}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id || index}>
              {renderItem ? (
                renderItem(item)
              ) : (
                <div className="p-3 bg-ground rounded-lg border border-line flex items-center justify-between group transition-colors hover:bg-surface hover:border-brand/30">
                  <div>
                    <p className="font-medium text-ink text-sm">
                      {item.name || item.title || "Registro"}
                    </p>
                    <p className="text-[12px] text-muted mt-0.5">{item.subtitle || ""}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand transition-colors" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {viewAllLink && items.length > 0 && (
        <Link
          to={viewAllLink}
          className="mt-4 text-center text-[13px] font-medium text-muted hover:text-brand transition-colors py-2 border-t border-line pt-3"
        >
          Ver todos os registros
        </Link>
      )}
    </div>
  )
}
