import { lazy } from "react"
import { Route } from "react-router-dom"

const Landing = lazy(() => import("./pages/Landing"))

const LandingRoutes = <Route path="/" element={<Landing />} />

export default LandingRoutes
