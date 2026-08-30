import { useState, useCallback, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle } from "lucide-react"
import { ConfirmContext } from "./confirm-context"

function ConfirmDialog({ open, options, onConfirm, onCancel }) {
  const {
    title = "Confirmar ação",
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    danger = false,
  } = options

  const confirmButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return
    confirmButtonRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {danger && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">{title}</h3>
            {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, options: {} })
  const resolver = useRef(null)

  const confirm = useCallback((options = {}) => {
    setState({ open: true, options })
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = useCallback((result) => {
    setState((current) => ({ ...current, open: false }))
    resolver.current?.(result)
    resolver.current = null
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        options={state.options}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  )
}
