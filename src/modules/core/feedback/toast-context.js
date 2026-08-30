import { createContext, useContext } from "react"

export const ToastContext = createContext(null)

// Devolve { success, error, info } — cada um empurra um toast.
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast precisa estar dentro de <ToastProvider>")
  }
  return context
}
