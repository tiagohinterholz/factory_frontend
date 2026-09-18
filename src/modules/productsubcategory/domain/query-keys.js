// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar productSubcategoryKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const productSubcategoryKeys = {
  all: ["product-subcategories"],
  lists: () => [...productSubcategoryKeys.all, "list"],
  list: (params) => [...productSubcategoryKeys.lists(), params],
}
