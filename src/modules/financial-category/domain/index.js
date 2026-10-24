import { z } from "zod"
import { requiredText } from "@/modules/core/schemas/br-fields"

export const financialCategoryKeys = {
  all: ["financial-categories"],
  lists: () => [...financialCategoryKeys.all, "list"],
  list: (params) => [...financialCategoryKeys.lists(), params],
  options: () => [...financialCategoryKeys.all, "options"],
  subcategories: (categoryId) => [...financialCategoryKeys.all, "subcategories", categoryId],
}

export const financialTagKeys = {
  all: ["financial-tags"],
  lists: () => [...financialTagKeys.all, "list"],
  list: (params) => [...financialTagKeys.lists(), params],
  options: () => [...financialTagKeys.all, "options"],
}

export const MANUAL_CATEGORY_CODES = ["aluguel", "folha", "outro"]

export const categoryUsableInManualEntry = (category) =>
  category.is_active !== false && (!category.code || MANUAL_CATEGORY_CODES.includes(category.code))

export const legacyCategoryFor = (category) =>
  category?.code && MANUAL_CATEGORY_CODES.includes(category.code) ? category.code : "outro"

export const financialCategorySchema = z.object({
  name: requiredText("Informe o nome da categoria"),
  is_active: z.boolean(),
})

export const financialCategoryDefaults = { name: "", is_active: true }
