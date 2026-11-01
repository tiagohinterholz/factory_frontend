import { lazy } from "react"
import { Navigate, Route } from "react-router-dom"

const FiscalNotes = lazy(() => import("./pages/FiscalNotes"))

const FiscalRoutes = [
  <Route
    key="fiscal-notes-redirect"
    path="/notas-fiscais"
    element={<Navigate to="/notas-fiscais/nfe" replace />}
  />,
  <Route key="fiscal-notes" path="/notas-fiscais/:kind" element={<FiscalNotes />} />,
]

export default FiscalRoutes
