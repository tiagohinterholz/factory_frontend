import { Route } from "react-router-dom";
import StateList from "./state/pages/StateList";
import StateCreate from "./state/pages/StateCreate";
import StateEdit from "./state/pages/StateEdit";
import CityList from "./city/pages/CityList";
import CityCreate from "./city/pages/CityCreate";
import CityEdit from "./city/pages/CityEdit";

const LocationRoutes = (
  <>
    <Route path="/estados" element={<StateList />} />
    <Route path="/estados/novo" element={<StateCreate />} />
    <Route path="/estados/:id" element={<StateEdit />} />
    <Route path="/cidades" element={<CityList />} />
    <Route path="/cidades/novo" element={<CityCreate />} />
    <Route path="/cidades/:id" element={<CityEdit />} />
  </>
);

export default LocationRoutes;
