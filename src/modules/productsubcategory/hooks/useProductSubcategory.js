import { ProductSubcategoryService } from "@/modules/productsubcategory/services/productsubcategory"
import { productSubcategoryKeys } from "@/modules/productsubcategory/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useProductSubcategories() {
  const list = useResourceList({
    keyFactory: productSubcategoryKeys,
    fetchPage: (params) => ProductSubcategoryService.getProductSubcategories(params),
  })

  const remove = useResourceAction({
    mutationFn: (item) => ProductSubcategoryService.deleteProductSubcategory(item.id),
    confirm: (item) => ({
      title: "Excluir subcategoria?",
      message: `A subcategoria "${item.name}" será removida permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [productSubcategoryKeys.all],
    errorFallback: "Erro ao excluir a subcategoria.",
  })

  const { items, ...rest } = list
  return { ...rest, productSubcategories: items, remove: remove.run }
}
