import { z } from "zod"
import { requiredText } from "@/modules/core/schemas/br-fields"

// Backend (Manufacturer model / /marcas/): name obrigatório; is_active desativa
// a marca sem apagar o histórico de veículos/modelos que a referenciam.
export const manufacturerSchema = z.object({
  name: requiredText("Informe o nome da marca"),
  is_active: z.boolean(),
})

export const manufacturerDefaults = {
  name: "",
  is_active: true,
}
