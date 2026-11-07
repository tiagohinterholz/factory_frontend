import { useId, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Check, Edit2, Plus, Trash2, X } from "lucide-react"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { FinancialCategoryService } from "../services/financial-category"
import { financialTagKeys } from "../domain"

const iconButton = "p-1.5 rounded transition-colors"

export default function FinancialTagList() {
  const inputId = useId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { canChangeFinancialEntry } = usePermissions()
  const [name, setName] = useState("")
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const { items, loading, error, refetch, currentPage, setCurrentPage, totalItems } =
    useResourceList({
      keyFactory: financialTagKeys,
      fetchPage: (params) => FinancialCategoryService.getTags(params),
    })

  const remove = useResourceAction({
    mutationFn: (tag) => FinancialCategoryService.deleteTag(tag.id),
    confirm: (tag) => ({
      title: "Excluir tag?",
      message: `A tag "${tag.name}" sai de todos os lançamentos.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [financialTagKeys.all],
    errorFallback: "Erro ao excluir a tag.",
  })

  async function save(action, fallback) {
    setSaving(true)
    try {
      await action()
      queryClient.invalidateQueries({ queryKey: financialTagKeys.all })
      return true
    } catch (apiError) {
      toast.error(parseApiError(apiError, fallback).message)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (!name.trim()) return
    if (
      await save(
        () => FinancialCategoryService.createTag({ name: name.trim() }),
        "Erro ao criar a tag.",
      )
    ) {
      setName("")
    }
  }

  async function handleRename() {
    if (!editing?.name.trim()) return
    if (
      await save(
        () => FinancialCategoryService.updateTag(editing.id, { name: editing.name.trim() }),
        "Erro ao renomear a tag.",
      )
    ) {
      setEditing(null)
    }
  }

  const columns = [
    {
      header: "Tag",
      accessor: (tag) =>
        editing?.id === tag.id ? (
          <input
            aria-label="Novo nome da tag"
            className="input-premium !py-1"
            value={editing.name}
            onChange={(event) => setEditing({ ...editing, name: event.target.value })}
            autoFocus
          />
        ) : (
          tag.name
        ),
    },
    { header: "Lançamentos", accessor: (tag) => tag.entries_count ?? 0 },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Tags do Financeiro" />
      {canChangeFinancialEntry && (
        <form onSubmit={handleCreate} className="card-premium flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor={inputId} className="label-premium">
              Nova tag
            </label>
            <input
              id={inputId}
              className="input-premium"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Cliente recorrente"
              maxLength={40}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            title="Adicionar tag"
            aria-label="Adicionar tag"
            className="p-3 bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </form>
      )}
      <ListTable
        columns={columns}
        data={items}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
        renderActions={
          canChangeFinancialEntry
            ? (tag) =>
                editing?.id === tag.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={handleRename}
                      disabled={saving}
                      title="Salvar nome"
                      aria-label="Salvar nome"
                      className={`${iconButton} text-emerald-600 hover:bg-emerald-50`}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      title="Cancelar edição"
                      aria-label="Cancelar edição"
                      className={`${iconButton} text-slate-500 hover:bg-slate-100`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing({ id: tag.id, name: tag.name })}
                      title="Renomear tag"
                      aria-label={`Renomear tag ${tag.name}`}
                      className={`${iconButton} text-brand hover:bg-brand-subtle`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove.run(tag)}
                      title="Excluir tag"
                      aria-label={`Excluir tag ${tag.name}`}
                      className={`${iconButton} text-danger hover:bg-danger-subtle`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
            : undefined
        }
      />
    </div>
  )
}
