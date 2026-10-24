import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { FiscalNoteService } from "../services/fiscal-notes"
import { fiscalNoteKeys } from "../domain"

const EMPTY_FILTERS = {
  kind: "",
  status: "",
  client_id: "",
  date_from: "",
  date_to: "",
}

export function useFiscalNotes() {
  const { items, ...rest } = useResourceList({
    keyFactory: fiscalNoteKeys,
    fetchPage: (params) => FiscalNoteService.getFiscalNotes(params),
    emptyFilters: EMPTY_FILTERS,
  })
  return { ...rest, notes: items }
}
