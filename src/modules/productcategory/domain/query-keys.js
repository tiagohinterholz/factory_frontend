// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar productCategoryKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const productCategoryKeys = {
  all: ["product-categories"],
  lists: () => [...productCategoryKeys.all, "list"],
  list: (params) => [...productCategoryKeys.lists(), params],
  subcategoriesByCategory: (categoryId) => [
    ...productCategoryKeys.all,
    "subcategories",
    categoryId,
  ],
}
