import { z } from "zod"

// Backend: City.name max_length=50, state_id FK obrigatório. Sem validador de formato.
export const citySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  state_id: z.string().trim().min(1, "Selecione o estado"),
})

export const cityDefaults = { name: "", state_id: "" }
