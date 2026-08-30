import { createContext, useContext } from "react"

export const ConfirmContext = createContext(null)

// Devolve confirm(options) => Promise<boolean>
export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>")
  }
  return context
}
