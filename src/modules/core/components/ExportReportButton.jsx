import { useEffect, useState } from "react"
import { FileDown, Loader2, ChevronDown, X } from "lucide-react"
import { useReportExport } from "@/modules/core/hooks/useReportExport"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import {
  useClientOptions,
  useVehicleOptions,
  useSupplierOptions,
} from "@/modules/core/hooks/options"
import FilterSelect from "@/modules/core/components/FilterSelect"
import FormField from "@/modules/core/components/FormField"
import { REPORT_STATUS_OPTIONS, FILTERABLE_REPORTS } from "@/modules/core/constants/report"

const EMPTY = {
  status: "",
  client_id: "",
  vehicle_id: "",
  supplier_id: "",
  date_from: "",
  date_to: "",
}

function FilterPopover({ type, onSubmit, onClose }) {
  const [filters, setFilters] = useState(EMPTY)
  const setField = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }))
  const setValue = (key) => (next) => setFilters((current) => ({ ...current, [key]: next }))

  const { client } = useClientOptions()
  const { vehicle } = useVehicleOptions()
  const { supplier } = useSupplierOptions()

  const clientOpts = client.map((c) => ({ id: c.id, name: `${c.first_name} ${c.last_name}` }))
  const vehicleOpts = vehicle.map((v) => ({
    id: v.id,
    name: `${v.manufacturer} ${v.model} (${v.plate})`,
  }))
  const supplierOpts = supplier.map((s) => ({ id: s.id, name: s.trade_name || s.corporate_name }))

  return (
    <div className="fixed inset-x-3 top-24 z-40 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-surface shadow-pop p-4 space-y-3 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 sm:max-h-none sm:overflow-visible">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink">Filtros (todos opcionais)</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar filtros"
          className="-mr-1 rounded p-1 text-muted hover:bg-ground hover:text-ink"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <FilterSelect
        label="Status"
        options={REPORT_STATUS_OPTIONS[type]}
        value={filters.status}
        onChange={setValue("status")}
      />
      <FilterSelect
        label="Cliente"
        options={clientOpts}
        value={filters.client_id}
        onChange={setValue("client_id")}
      />
      <FilterSelect
        label="Veículo"
        options={vehicleOpts}
        value={filters.vehicle_id}
        onChange={setValue("vehicle_id")}
      />
      <FilterSelect
        label="Fornecedor"
        options={supplierOpts}
        value={filters.supplier_id}
        onChange={setValue("supplier_id")}
      />

      <div className="grid grid-cols-2 gap-2">
        <FormField
          label="De"
          type="date"
          value={filters.date_from}
          onChange={setField("date_from")}
        />
        <FormField label="Até" type="date" value={filters.date_to} onChange={setField("date_to")} />
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setFilters(EMPTY)}
          className="text-[13px] text-muted hover:text-ink"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={() => onSubmit(filters)}
          className="btn-primary !px-3 !py-1.5 !text-[13px]"
        >
          Gerar relatório
        </button>
      </div>
    </div>
  )
}

// `type`: "orders" | "budgets" | "stock". orders/budgets abrem um popover
// de filtros; stock dispara direto. Só aparece pra superusuário / admin.
export default function ExportReportButton({ type, label = "Exportar PDF" }) {
  const { canExportReports } = usePermissions()
  const { exportReport, isExporting } = useReportExport()
  const [open, setOpen] = useState(false)

  // Fecha no próprio botão, no X, no "Gerar relatório" e no Esc.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  if (!canExportReports) return null

  const busy = isExporting(type)
  const filterable = FILTERABLE_REPORTS.includes(type)

  const trigger = (
    <button
      type="button"
      onClick={() => (filterable ? setOpen((current) => !current) : exportReport(type))}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-ground hover:text-ink disabled:pointer-events-none disabled:opacity-60"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {busy ? "Gerando…" : label}
      {filterable && !busy && <ChevronDown className="w-3.5 h-3.5" />}
    </button>
  )

  if (!filterable) return trigger

  return (
    <div className="relative">
      {trigger}
      {open && (
        <FilterPopover
          type={type}
          onClose={() => setOpen(false)}
          onSubmit={(filters) => {
            setOpen(false)
            exportReport(type, filters)
          }}
        />
      )}
    </div>
  )
}
