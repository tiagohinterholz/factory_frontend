import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { fetchAllPages } from "@/api/fetch-all-pages"
import { idOf } from "@/api/dto"
import { FinancialCategoryService } from "../services/financial-category"
import {
  financialCategoryKeys,
  financialTagKeys,
  financialSubcategoryKeys,
  financialSubcategorySchema,
  financialSubcategoryDefaults,
} from "../domain"

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

export function useFinancialSubcategoryForm() {
  return useResourceForm({
    schema: financialSubcategorySchema,
    defaultValues: financialSubcategoryDefaults,
    submit: (values) => FinancialCategoryService.createSubcategory(values),
    redirectTo: "/subcategorias-financeiro",
    invalidate: [financialSubcategoryKeys.all],
    errorFallback: "Erro ao criar subcategoria",
  })
}

export function useFinancialSubcategoryEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: financialSubcategorySchema,
    defaultValues: financialSubcategoryDefaults,
    load: async () => {
      const data = await FinancialCategoryService.getSubcategory(id)
      return { name: data.name ?? "", category_id: idOf(data.category) }
    },
    submit: (values) => FinancialCategoryService.updateSubcategory(id, values),
    redirectTo: "/subcategorias-financeiro",
    invalidate: [financialSubcategoryKeys.all],
    errorFallback: "Erro ao atualizar subcategoria",
  })

  const remove = useResourceAction({
    mutationFn: () => FinancialCategoryService.deleteSubcategory(id),
    confirm: {
      title: "Excluir subcategoria?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [financialSubcategoryKeys.all],
    onSuccess: () => navigate("/subcategorias-financeiro"),
    errorFallback: "Erro ao excluir subcategoria",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}

export function useFinancialTagOptions() {
  const query = useQuery({
    queryKey: financialTagKeys.options(),
    queryFn: () => fetchAllPages((page) => FinancialCategoryService.getTags({ page })),
  })
  return { tags: query.data ?? [], loading: query.isPending }
}
