import { lazy } from "react"
import { Route } from "react-router-dom"

const MyLicense = lazy(() => import("./pages/MyLicense"))
const LicenseRenewPayment = lazy(() => import("./pages/LicenseRenewPayment"))
const LicenseList = lazy(() => import("./pages/LicenseList"))
const LicenseDetail = lazy(() => import("./pages/LicenseDetail"))

const LicenseRoutes = (
  <>
    {/* self-service: admin/colaborador vê e renova a própria licença */}
    <Route path="/configuracoes/licenca" element={<MyLicense />} />
    {/* espera da cobrança de renovação (4.4.2), até o pagamento confirmar */}
    <Route path="/configuracoes/licenca/pagamento/:id" element={<LicenseRenewPayment />} />
    {/* superusuário navegando licenças de outros negócios — só leitura */}
    <Route path="/licencas" element={<LicenseList />} />
    <Route path="/licencas/:id" element={<LicenseDetail />} />
  </>
)

export default LicenseRoutes
