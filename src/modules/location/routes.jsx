import { lazy } from "react"
import { Route } from "react-router-dom"

const StateList = lazy(() => import("./state/pages/StateList"))
const StateEdit = lazy(() => import("./state/pages/StateEdit"))
const CityList = lazy(() => import("./city/pages/CityList"))
const CityCreate = lazy(() => import("./city/pages/CityCreate"))
const CityEdit = lazy(() => import("./city/pages/CityEdit"))

const LocationRoutes = (
  <>
    <Route path="/estados" element={<StateList />} />
    <Route path="/estados/:id" element={<StateEdit />} />
    <Route path="/cidades" element={<CityList />} />
    <Route path="/cidades/novo" element={<CityCreate />} />
    <Route path="/cidades/:id" element={<CityEdit />} />
  </>
)

export default LocationRoutes
