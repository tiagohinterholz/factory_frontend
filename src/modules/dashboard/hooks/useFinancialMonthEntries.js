import { useQuery } from "@tanstack/react-query"
import { FinancialEntryService } from "@/modules/financial-entry"
import { currentMonthRange } from "@/modules/dashboard/domain/financial-month"
import { normalizeList } from "@/api/normalize-list"

// Lista de lançamentos que bate a combinação Tipo+Status escolhida no card
// "Financeiro do mês", sempre restrita ao mês vigente (mesmo recorte de
// due_date que o back usa pra montar entries_by_status). Sem paginação
// própria — é um card de resumo, não a listagem completa (que já existe em
// /financeiro), então mostra só a primeira página (10 itens, default da API).
export function useFinancialMonthEntries(entryType, status) {
  const { date_from, date_to } = currentMonthRange()

  const query = useQuery({
    queryKey: ["dashboard-financial-month-entries", entryType, status, date_from, date_to],
    enabled: Boolean(entryType && status),
    queryFn: () =>
      FinancialEntryService.getFinancialEntry({
        entry_type: entryType,
        status,
        date_from,
        date_to,
        ordering: "due_date",
      }),
    select: normalizeList,
  })

  return {
    entries: query.data?.results ?? [],
    loading: query.isPending,
    error: query.error ?? null,
  }
}
