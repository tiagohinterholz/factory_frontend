import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Bell } from "lucide-react"
import { useLicense } from "@/modules/license/hooks/useLicense"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

const STATUS_LABEL = {
  TRIAL: "Em teste",
  ACTIVE: "Ativa",
  EXPIRED: "Expirada",
}

function daysBetween(startIso, endIso) {
  if (!startIso || !endIso) return 0
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return 0
  return Math.max(0, Math.round((end - start) / 86_400_000))
}

export default function LicenseNotification() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const { license, loading } = useLicense()
  const { isSuperUser, isAdmin } = usePermissions()

  useEffect(() => {
    if (!open) return
    const onClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const current = Array.isArray(license) ? license[0] : license
  const hasLicense = !isSuperUser && Boolean(current)

  const remaining = hasLicense ? (current.remaining_days ?? 0) : 0
  const total = hasLicense ? daysBetween(current.activation_date, current.expiration_date) : 0
  const used = total ? Math.min(total, Math.max(0, total - remaining)) : 0
  const percent = total ? Math.round((used / total) * 100) : 0

  // âmbar quando <= 15 dias, vermelho quando <= 3 ou já expirada
  const level = !hasLicense || remaining > 15 ? "ok" : remaining > 3 ? "warn" : "danger"
  const showDot = hasLicense && level !== "ok"

  const barColor = level === "danger" ? "bg-danger" : level === "warn" ? "bg-warn" : "bg-brand"
  const pillColor =
    level === "danger"
      ? "bg-danger-subtle text-danger"
      : level === "warn"
        ? "bg-warn-subtle text-warn"
        : "bg-ok-subtle text-ok"

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Notificações"
        aria-expanded={open}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-brand transition duration-300"
      >
        <Bell className="w-5 h-5" />
        {showDot && (
          <span
            title={level === "danger" ? "Licença expirando" : "Licença perto de expirar"}
            className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white ${
              level === "danger" ? "bg-danger" : "bg-warn"
            }`}
          ></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 z-50">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Notificações
          </p>

          {loading ? (
            <div className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
          ) : !hasLicense ? (
            <p className="text-sm text-muted">
              {isSuperUser ? "Nenhuma licença associada à sua conta." : "Sem licença ativa."}
            </p>
          ) : (
            <div className="rounded-xl border border-line p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-ink">Licença</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pillColor}`}
                >
                  {STATUS_LABEL[current.status] || current.status}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} transition-all`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[12px] text-muted tabular-nums">
                <span>
                  {used} de {total} dias usados
                </span>
                <span className="font-medium text-ink">{remaining} dias restantes</span>
              </div>

              {current.max_users != null && (
                <div className="mt-1 text-[12px] text-muted tabular-nums">
                  {current.current_users ?? 0} de {current.max_users} usuários
                </div>
              )}

              {isAdmin && (
                <Link
                  to="/empreendimentos/licencas"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-block text-[13px] font-semibold text-brand hover:underline"
                >
                  Renovar licença →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
