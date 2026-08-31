import { useLocation } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { CityService } from "@/modules/location/city/services/city"
import { citySchema, cityDefaults } from "../city.schema"

export function useCityForm() {
  const location = useLocation()
  const preselectedState = location.state?.stateId

  return useResourceForm({
    schema: citySchema,
    defaultValues: {
      ...cityDefaults,
      state_id: preselectedState ? String(preselectedState) : "",
    },
    submit: (values) => CityService.createCity(values),
    redirectTo: "/cidades",
    errorFallback: "Erro ao criar cidade",
  })
}
