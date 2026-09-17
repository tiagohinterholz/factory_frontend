import { FinancialEntryService } from "@/modules/financial-entry/services/financial-entry"
import { financialEntryKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

const EMPTY_FILTERS = {
  entry_type: "",
  category: "",
  status: "",
  date_from: "",
  date_to: "",
}

export function useFinancialEntry() {
  const list = useResourceList({
    keyFactory: financialEntryKeys,
    fetchPage: (params) => FinancialEntryService.getFinancialEntry(params),
    emptyFilters: EMPTY_FILTERS,
  })

  const markPaid = useResourceAction({
    mutationFn: (item) => FinancialEntryService.markFinancialEntryPaid(item.id),
    confirm: (item) => ({
      title: "Marcar como pago?",
      message: `O lançamento #${item.id} será marcado como pago hoje.`,
      confirmText: "Marcar como pago",
    }),
    invalidate: [financialEntryKeys.all, dashboardKeys.all],
    success: (item) => `Lançamento #${item.id} marcado como pago.`,
    errorFallback: "Erro ao marcar o lançamento como pago.",
  })

  const cancel = useResourceAction({
    mutationFn: (item) => FinancialEntryService.cancelFinancialEntry(item.id),
    confirm: (item) => ({
      title: "Cancelar lançamento?",
      message: `O lançamento #${item.id} será marcado como cancelado — não pode ser desfeito.`,
      confirmText: "Sim, cancelar",
      danger: true,
    }),
    invalidate: [financialEntryKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao cancelar o lançamento.",
  })

  const { items, ...rest } = list
  return {
    ...rest,
    entries: items,
    markPaid: markPaid.run,
    cancel: cancel.run,
  }
}
