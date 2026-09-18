import { z } from "zod"
import { requiredText } from "@/modules/core/schemas/br-fields"

// Backend (ProductCategory model / /categorias-produto/): name obrigatório;
// is_active desativa a categoria sem apagar o histórico de produtos/
// subcategorias que a referenciam.
export const productCategorySchema = z.object({
  name: requiredText("Informe o nome da categoria"),
  is_active: z.boolean(),
})

export const productCategoryDefaults = {
  name: "",
  is_active: true,
}
