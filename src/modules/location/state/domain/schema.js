import { z } from "zod"

// Estado não tem mais create/delete. No PATCH, só is_active é gravado —
// name/abbreviation/ibge_code vêm carregados só para exibição (somente-leitura).
export const stateSchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  ibge_code: z.number().nullable(),
  is_active: z.boolean(),
})

export const stateDefaults = {
  name: "",
  abbreviation: "",
  ibge_code: null,
  is_active: true,
}
