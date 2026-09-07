import {
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Link } from "react-router-dom"

// Cabeçalho de coluna. Se a coluna tem `sortKey` e o pai passou `onSort`,
// vira um botão que cicla asc -> desc -> sem ordenação (ver useListSort).
function HeaderCell({ column, className, ordering, onSort }) {
  const sortable = Boolean(column.sortKey && onSort)
  if (!sortable) return <th className={className}>{column.header}</th>

  const asc = ordering === column.sortKey
  const desc = ordering === `-${column.sortKey}`
  const Icon = asc ? ArrowUp : desc ? ArrowDown : ArrowUpDown

  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(column.sortKey)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-ink ${
          asc || desc ? "text-ink" : ""
        }`}
      >
        {column.header}
        <Icon className={`w-3 h-3 ${asc || desc ? "" : "opacity-40"}`} />
      </button>
    </th>
  )
}

export default function ListTable({
  columns,
  data = [],
  onDelete,
  editLinkPrefix,
  loading,
  error,
  onRetry,
  renderActions,
  currentPage,
  handlePageChange,
  totalItems,
  itemsPerPage = 10,
  dense = false,
  ordering,
  onSort,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  // `dense`: aperta o padding horizontal das células (tabelas com muitas colunas)
  const cx = dense ? "px-3" : "px-5"
  const bleed = dense ? "-mx-3" : "-mx-5"
  const headClass = `${cx} py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted`

  return (
    <div className="card-premium flex flex-col gap-4 overflow-hidden">
      <div className={`overflow-x-auto ${bleed}`}>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-ground border-y border-line">
              {columns.map((col, idx) => (
                <HeaderCell
                  key={idx}
                  column={col}
                  className={headClass}
                  ordering={ordering}
                  onSort={onSort}
                />
              ))}
              <th
                className={`${cx} py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted text-right`}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, idx) => (
                    <td key={idx} className={`${cx} py-2.5`}>
                      <div className="h-3.5 bg-line rounded animate-pulse"></div>
                    </td>
                  ))}
                  <td className={`${cx} py-2.5`}>
                    <div className="h-3.5 bg-line rounded animate-pulse w-1/2 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length + 1} className={`${cx} py-12 text-center`}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-subtle text-danger">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-ink">
                      Não foi possível carregar os dados.
                    </p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-ground"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Tentar de novo
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="group hover:bg-ground transition-colors duration-150"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`${cx} py-2.5 text-sm text-ink tabular-nums`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                  <td className={`${cx} py-2.5 text-right`}>
                    <div className="flex justify-end gap-1">
                      {renderActions ? (
                        renderActions(item)
                      ) : (
                        <>
                          {editLinkPrefix && (
                            <Link
                              to={`${editLinkPrefix}/${item.id}`}
                              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
                            >
                              <Edit2 size={16} />
                            </Link>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="p-1.5 text-danger hover:bg-danger-subtle rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className={`${cx} py-10 text-center text-muted text-sm`}
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
          <div className="text-[13px] text-muted">
            <span className="font-medium text-ink tabular-nums">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>
            {"–"}
            <span className="font-medium text-ink tabular-nums">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            de <span className="font-medium text-ink tabular-nums">{totalItems}</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-line rounded disabled:opacity-40 hover:bg-ground text-muted transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="flex items-center px-3 text-[13px] font-medium text-ink tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-line rounded disabled:opacity-40 hover:bg-ground text-muted transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
