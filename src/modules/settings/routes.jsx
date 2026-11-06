import { lazy } from "react"
import { Route } from "react-router-dom"

const Settings = lazy(() => import("./pages/Settings"))
const CertificateSettings = lazy(() => import("./pages/CertificateSettings"))

const SettingsRoutes = (
  <>
    <Route path="/configuracoes" element={<Settings />} />
    <Route path="/configuracoes/certificado" element={<CertificateSettings />} />
  </>
)

export default SettingsRoutes
