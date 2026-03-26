import { Save } from "lucide-react"

export default function PrimaryButton({ children, type = "button", icon: Icon = Save, fullWidth = true }) {
  return (
    <button 
      type={type}
      className={`btn-primary ${fullWidth ? "w-full" : "px-8"}`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  )
}
