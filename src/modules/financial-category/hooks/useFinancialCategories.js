import { useQuery } from "@tanstack/react-query"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { fetchAllPages } from "@/api/fetch-all-pages"
import { FinancialCategoryService } from "../services/financial-category"
import { financialCategoryKeys, financialTagKeys, financialSubcategoryKeys } from "../domain"

export function useFinancialCategories() {
  const list = useResourceList({
    keyFactory: financialCategoryKeys,
    fetchPage: (params) => FinancialCategoryService.getCategories(params),
  })

  const remove = useResourceAction({
    mutationFn: (item) => FinancialCategoryService.deleteCategory(item.id),
    confirm: (item) => ({
      title: "Excluir categoria?",
      message: `A categoria "${item.name}" será removida.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [financialCategoryKeys.all],
    errorFallback: "Erro ao excluir a categoria.",
  })

  const { items, ...rest } = list
  return { ...rest, categories: items, remove: remove.run }
}

export function useFinancialCategoryOptions() {
  const query = useQuery({
    queryKey: financialCategoryKeys.options(),
    queryFn: () => fetchAllPages((page) => FinancialCategoryService.getCategories({ page })),
  })
  return { categories: query.data ?? [], loading: query.isPending }
}

export function useFinancialSubcategoryOptions(categoryId) {
  const query = useQuery({
    queryKey: financialCategoryKeys.subcategories(categoryId),
    queryFn: () =>
      fetchAllPages((page) =>
        FinancialCategoryService.getSubcategoriesByCategory(categoryId, { page }),
      ),
    enabled: Boolean(categoryId),
  })
  return { subcategories: query.data ?? [], loading: query.isFetching }
}

export function useFinancialSubcategories() {
  const list = useResourceList({
    keyFactory: financialSubcategoryKeys,
    fetchPage: (params) => FinancialCategoryService.getSubcategories(params),
  })

  const remove = useResourceAction({
    mutationFn: (item) => FinancialCategoryService.deleteSubcategory(item.id),
    confirm: (item) => ({
      title: "Excluir subcategoria?",
      message: `A subcategoria "${item.name}" será removida permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [financialSubcategoryKeys.all],
    errorFallback: "Erro ao excluir a subcategoria.",
  })

  const { items, ...rest } = list
  return { ...rest, subcategories: items, remove: remove.run }
}

export function useFinancialTagOptions() {
  const query = useQuery({
    queryKey: financialTagKeys.options(),
    queryFn: () => fetchAllPages((page) => FinancialCategoryService.getTags({ page })),
  })
  return { tags: query.data ?? [], loading: query.isPending }
}
