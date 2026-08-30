import { useState, useCallback, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"
import { ToastContext } from "./toast-context"

let idSequence = 0

const VARIANTS = {
  success: { Icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  error: { Icon: XCircle, className: "border-rose-200 bg-rose-50 text-rose-800" },
  info: { Icon: Info, className: "border-slate-200 bg-white text-slate-700" },
}

function ToastItem({ type, message, onClose }) {
  const { Icon, className } = VARIANTS[type] ?? VARIANTS.info
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border p-3 shadow-lg shadow-slate-200/50 ${className}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1 break-words text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="shrink-0 opacity-60 transition hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (type, message, duration) => {
      const id = ++idSequence
      setToasts((list) => [...list, { id, type, message }])
      timers.current.set(id, setTimeout(() => remove(id), duration))
      return id
    },
    [remove]
  )

  const toast = useMemo(
    () => ({
      success: (message, options = {}) => push("success", message, options.duration ?? 4000),
      error: (message, options = {}) => push("error", message, options.duration ?? 6000),
      info: (message, options = {}) => push("info", message, options.duration ?? 4000),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => remove(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
