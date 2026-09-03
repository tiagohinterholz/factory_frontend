import { lazy } from "react"
import { Route } from "react-router-dom"

const Settings = lazy(() => import("./pages/Settings"))

const SettingsRoutes = <Route path="/configuracoes" element={<Settings />} />

export default SettingsRoutes
