import { ProductCategoryService } from "@/modules/productcategory/services/productcategory"
import { productCategoryKeys } from "@/modules/productcategory/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useProductCategories() {
  const list = useResourceList({
    keyFactory: productCategoryKeys,
    fetchPage: (params) => ProductCategoryService.getProductCategories(params),
  })

  const remove = useResourceAction({
    mutationFn: (item) => ProductCategoryService.deleteProductCategory(item.id),
    confirm: (item) => ({
      title: "Excluir categoria?",
      message: `A categoria "${item.name}" será removida permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [productCategoryKeys.all],
    errorFallback: "Erro ao excluir a categoria.",
  })

  const { items, ...rest } = list
  return { ...rest, productCategories: items, remove: remove.run }
}
