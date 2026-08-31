import { z } from "zod"

// Backend: State.abbreviation max_length=2, name max_length=20. Sem validador de formato.
export const stateSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  abbreviation: z.string().trim().min(1, "Informe a UF").max(2, "UF tem 2 letras"),
})

export const stateDefaults = { name: "", abbreviation: "" }
