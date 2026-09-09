import { ProductService } from "@/modules/product/services/product"
import { productKeys } from "@/modules/product/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useProduct() {
  const list = useResourceList({
    keyFactory: productKeys,
    fetchPage: (params) => ProductService.getProduct(params),
    emptyFilters: { name: "", reference: "", supplier_id: "" },
  })

  const remove = useResourceAction({
    mutationFn: (item) => ProductService.deleteProduct(item.id),
    confirm: (item) => ({
      title: "Excluir produto?",
      message: `"${item.name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [productKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao excluir o produto.",
  })

  const { items, ...rest } = list
  return { ...rest, product: items, remove: remove.run }
}
