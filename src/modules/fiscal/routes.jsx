import { lazy } from "react"
import { Route } from "react-router-dom"

const FiscalNotes = lazy(() => import("./pages/FiscalNotes"))

const FiscalRoutes = <Route path="/notas-fiscais" element={<FiscalNotes />} />

export default FiscalRoutes
