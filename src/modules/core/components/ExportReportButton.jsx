import { useEffect, useRef, useState } from "react"
import { FileDown, Loader2, ChevronDown } from "lucide-react"
import { useReportExport } from "@/modules/core/hooks/useReportExport"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import {
  useClientOptions,
  useVehicleOptions,
  useSupplierOptions,
} from "@/modules/core/hooks/options"
import SelectField from "@/modules/core/components/SelectField"
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

function FilterPopover({ type, onSubmit }) {
  const [filters, setFilters] = useState(EMPTY)
  const set = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }))

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
    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-line bg-surface shadow-pop p-4 z-30 space-y-3">
      <p className="text-[13px] font-medium text-ink">Filtros (todos opcionais)</p>

      <SelectField
        label="Status"
        options={REPORT_STATUS_OPTIONS[type]}
        value={filters.status}
        onChange={set("status")}
      />
      <SelectField
        label="Cliente"
        options={clientOpts}
        value={filters.client_id}
        onChange={set("client_id")}
      />
      <SelectField
        label="Veículo"
        options={vehicleOpts}
        value={filters.vehicle_id}
        onChange={set("vehicle_id")}
      />
      <SelectField
        label="Fornecedor"
        options={supplierOpts}
        value={filters.supplier_id}
        onChange={set("supplier_id")}
      />

      <div className="grid grid-cols-2 gap-2">
        <FormField label="De" type="date" value={filters.date_from} onChange={set("date_from")} />
        <FormField label="Até" type="date" value={filters.date_to} onChange={set("date_to")} />
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
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      document.removeEventListener("keydown", onKey)
    }
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
    <div className="relative" ref={containerRef}>
      {trigger}
      {open && (
        <FilterPopover
          type={type}
          onSubmit={(filters) => {
            setOpen(false)
            exportReport(type, filters)
          }}
        />
      )}
    </div>
  )
}
