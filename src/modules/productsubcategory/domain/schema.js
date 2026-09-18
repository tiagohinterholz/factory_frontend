import { z } from "zod"
import { requiredText, requiredId } from "@/modules/core/schemas/br-fields"

// Backend (ProductSubcategory model / /subcategorias-produto/): name +
// category_id obrigatórios.
export const productSubcategorySchema = z.object({
  name: requiredText("Informe o nome da subcategoria"),
  category_id: requiredId("Selecione a categoria"),
})

export const productSubcategoryDefaults = {
  name: "",
  category_id: "",
}
