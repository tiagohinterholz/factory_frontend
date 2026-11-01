import { useState } from "react"
import { CircleAlert } from "lucide-react"
import Modal from "./Modal"

const defaultClass = "p-1.5 text-danger hover:bg-danger-subtle rounded transition-colors"

export default function ErrorDetailButton({ message, label = "nota", className }) {
  const [open, setOpen] = useState(false)

  if (!message) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Ver motivo da falha na ${label}`}
        aria-label={`Ver motivo da falha na ${label}`}
        className={className || defaultClass}
      >
        <CircleAlert size={16} />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Motivo da falha">
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{message}</p>
      </Modal>
    </>
  )
}
