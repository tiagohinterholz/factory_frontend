import { Save } from "lucide-react"

export default function PrimaryButton({
  children,
  type = "button",
  icon: Icon = Save,
  fullWidth = true,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn-primary ${fullWidth ? "w-full" : "px-8"} ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  )
}
