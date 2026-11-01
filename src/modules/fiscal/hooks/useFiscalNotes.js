import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { FiscalNoteService } from "../services/fiscal-notes"
import { fiscalNoteKeys } from "../domain"

const EMPTY_FILTERS = {
  status: "",
  client_id: "",
  date_from: "",
  date_to: "",
}

export function useFiscalNotes(kind) {
  const { items, ...rest } = useResourceList({
    keyFactory: {
      ...fiscalNoteKeys,
      list: (params) => fiscalNoteKeys.list({ ...params, kind }),
    },
    fetchPage: (params) => FiscalNoteService.getFiscalNotes({ ...params, kind }),
    emptyFilters: EMPTY_FILTERS,
  })
  return { ...rest, notes: items }
}
