import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

// Modal genérico: portal + overlay, fecha no Escape, no clique fora e no X.
// `footer` é opcional (ex.: um botão "Fechar").
export default function Modal({ open, onClose, title, footer, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[85vh] w-full flex-col rounded-2xl bg-white shadow-xl ${maxWidth}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-1.5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
