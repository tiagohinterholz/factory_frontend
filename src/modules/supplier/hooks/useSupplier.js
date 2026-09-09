import { SupplierService } from "@/modules/supplier/services/supplier"
import { supplierKeys } from "@/modules/supplier/domain"
import { productKeys } from "@/modules/product/domain"
import { workServiceKeys } from "@/modules/workservice/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useSupplier() {
  const list = useResourceList({
    keyFactory: supplierKeys,
    fetchPage: (params) => SupplierService.getSupplier(params),
    emptyFilters: { cnpj: "", corporate_name: "" },
  })

  const remove = useResourceAction({
    mutationFn: (item) => SupplierService.deleteSupplier(item.id),
    confirm: (item) => ({
      title: "Excluir fornecedor?",
      message: `"${item.corporate_name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [supplierKeys.all, productKeys.all, workServiceKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao excluir o fornecedor.",
  })

  const { items, ...rest } = list
  return { ...rest, supplier: items, remove: remove.run }
}
