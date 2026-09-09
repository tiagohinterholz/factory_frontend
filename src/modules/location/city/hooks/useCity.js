import { useQuery } from "@tanstack/react-query"
import { CityService } from "@/modules/location/city/services/city"
import { StateService } from "@/modules/location/state/services/state"
import { normalizeList } from "@/api/normalize-list"
import { cityKeys } from "@/modules/location/city/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useCities() {
  const list = useResourceList({
    keyFactory: cityKeys,
    fetchPage: (params) => CityService.getCities(params),
  })

  const remove = useResourceAction({
    mutationFn: (item) => CityService.deleteCity(item.id),
    confirm: (item) => ({
      title: "Excluir cidade?",
      message: `A cidade "${item.name}" será removida permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [cityKeys.all],
    errorFallback: "Erro ao excluir a cidade.",
  })

  const { items, ...rest } = list
  return { ...rest, cities: items, remove: remove.run }
}

// Cidades de um estado, ordenadas por nome. Só busca quando há stateId.
export function useCitiesByState(stateId) {
  const query = useQuery({
    queryKey: cityKeys.byState(stateId),
    queryFn: () => StateService.getCitiesByState(stateId),
    enabled: Boolean(stateId),
    select: (response) => {
      const list = normalizeList(response).results
      return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    },
  })

  return {
    citiesByState: query.data ?? [],
    loading: query.isFetching,
  }
}
