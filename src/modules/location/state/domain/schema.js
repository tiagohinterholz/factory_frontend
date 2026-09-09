import { z } from "zod"

// Estado não tem mais create/delete. No PATCH, só is_active é gravado —
// name/abbreviation vêm carregados só para exibição (somente-leitura).
export const stateSchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  is_active: z.boolean(),
})

export const stateDefaults = { name: "", abbreviation: "", is_active: true }
