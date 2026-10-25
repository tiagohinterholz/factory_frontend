import { Link } from "react-router-dom"
import { FileCode2, FileDown } from "lucide-react"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import { useClientOptions } from "@/modules/core/hooks/options"
import { formatDateTime } from "@/modules/core/utils/format"
import { useFiscalNotes } from "../hooks/useFiscalNotes"
import { FISCAL_KIND_OPTIONS, FISCAL_STATUS_OPTIONS, fiscalNoteStatusTone } from "../domain"

const downloadClass = "p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"

export default function FiscalNotes() {
  const {
    notes,
    loading,
    error,
    refetch,
    filters,
    applyFilters,
    currentPage,
    setCurrentPage,
    totalItems,
  } = useFiscalNotes()
  const { client: clients } = useClientOptions()

  const filterFields = [
    { name: "kind", label: "Tipo", type: "select", options: FISCAL_KIND_OPTIONS },
    { name: "status", label: "Status", type: "select", options: FISCAL_STATUS_OPTIONS },
    {
      name: "client_id",
      label: "Cliente",
      type: "select",
      options: clients.map((client) => ({ id: client.id, name: client.display_name })),
    },
    { name: "date_from", label: "Solicitada a partir de", type: "date" },
    { name: "date_to", label: "Solicitada até", type: "date" },
  ]

  const columns = [
    { header: "Tipo", accessor: (note) => note.kind_display },
    { header: "Número", accessor: (note) => note.number || "—" },
    {
      header: "OS",
      accessor: (note) => (
        <Link to={`/ordens/${note.order_id}`} className="text-brand hover:underline">
          OS #{note.order_id}
        </Link>
      ),
    },
    {
      header: "Cliente",
      accessor: (note) =>
        note.client_id ? (
          <Link to={`/clientes/${note.client_id}`} className="text-brand hover:underline">
            {note.client_name}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      header: "Status",
      accessor: (note) => (
        <div className="flex flex-col items-start gap-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${fiscalNoteStatusTone(note.status)}`}
          >
            {note.status_display}
          </span>
          {note.status === "failed" && note.error_message && (
            <span className="max-w-xs text-[11px] text-danger">{note.error_message}</span>
          )}
        </div>
      ),
    },
    { header: "Solicitada em", accessor: (note) => formatDateTime(note.created_at) },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Notas Fiscais"
        actions={<ListFilters fields={filterFields} value={filters} onApply={applyFilters} />}
      />
      <ListTable
        dense
        columns={columns}
        data={notes}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
        renderActions={(note) => (
          <div className="flex items-center justify-end gap-1">
            {note.pdf_url && (
              <a
                href={note.pdf_url}
                target="_blank"
                rel="noreferrer"
                title={`Baixar PDF da ${note.kind_display}`}
                aria-label={`Baixar PDF da ${note.kind_display}`}
                className={downloadClass}
              >
                <FileDown size={16} />
              </a>
            )}
            {note.xml_url && (
              <a
                href={note.xml_url}
                target="_blank"
                rel="noreferrer"
                title={`Baixar XML da ${note.kind_display}`}
                aria-label={`Baixar XML da ${note.kind_display}`}
                className={downloadClass}
              >
                <FileCode2 size={16} />
              </a>
            )}
          </div>
        )}
      />
    </div>
  )
}
