import { History } from "lucide-react"
import { useStockMovements } from "@/modules/purchase/hooks/useStockMovements"
import { stockMovementTypeLabel, stockMovementTypeTone } from "@/modules/purchase/domain"
import { formatDateTime } from "@/modules/core/utils/format"

// Kardex do produto — "mostra o histórico de estoque desse produto" (1.3).
export default function StockMovementHistory({ productId }) {
  const { movements, loading } = useStockMovements(productId)

  return (
    <div className="card-premium">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
        <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
          <History className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-800 tracking-tight">Histórico de Estoque</h3>
      </div>

      {loading && <p className="text-sm text-muted text-center py-4">Carregando...</p>}

      {!loading && movements.length === 0 && (
        <p className="text-sm text-muted text-center py-4">Nenhum movimento registrado ainda.</p>
      )}

      {!loading && movements.length > 0 && (
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {movements.map((movement) => (
            <div key={movement.id} className="py-3 flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className={`font-semibold ${stockMovementTypeTone(movement.movement_type)}`}>
                  {stockMovementTypeLabel(movement.movement_type)}
                </p>
                <p className="text-[11.5px] text-muted">{formatDateTime(movement.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-ink tabular-nums">
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </p>
                <p className="text-[11.5px] text-muted">
                  saldo: {movement.resulting_stock_quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
