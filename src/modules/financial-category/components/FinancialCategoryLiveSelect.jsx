import { useId, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import LiveSelect from "@/modules/core/components/LiveSelect"
import Modal from "@/modules/core/components/Modal"
import { parseApiError } from "@/api/parse-api-error"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { useFinancialCategoryOptions } from "../hooks/useFinancialCategories"
import { FinancialCategoryService } from "../services/financial-category"
import { categoryUsableInManualEntry, financialCategoryKeys } from "../domain"

export default function FinancialCategoryLiveSelect({ value, onChange, error, extraOption }) {
  const inputId = useId()
  const queryClient = useQueryClient()
  const { categories } = useFinancialCategoryOptions()
  const { canManageFinancialCategories } = usePermissions()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState("")

  const options = categories.filter(categoryUsableInManualEntry)

  function close() {
    setCreating(false)
    setName("")
    setCreateError("")
  }

  async function handleCreate() {
    if (!name.trim()) {
      setCreateError("Informe o nome da categoria")
      return
    }
    setSaving(true)
    try {
      const category = await FinancialCategoryService.createCategory({
        name: name.trim(),
        is_active: true,
      })
      queryClient.setQueryData(financialCategoryKeys.options(), (current) => [
        ...(current ?? []),
        category,
      ])
      queryClient.invalidateQueries({ queryKey: financialCategoryKeys.all })
      onChange(String(category.id), category)
      close()
    } catch (apiError) {
      setCreateError(parseApiError(apiError, "Erro ao criar a categoria").message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <LiveSelect
        label="Categoria *"
        options={options}
        value={value}
        onChange={(id) => {
          if (String(id) === String(value)) return
          onChange(id, options.find((option) => String(option.id) === String(id)) ?? null)
        }}
        error={error}
        extraOption={extraOption}
        createLabel="Cadastrar nova categoria"
        onCreateNew={canManageFinancialCategories ? () => setCreating(true) : undefined}
      />
      <Modal
        open={creating}
        onClose={close}
        title="Nova categoria financeira"
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              type="button"
              onClick={close}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
            >
              Cadastrar
            </button>
          </>
        }
      >
        <label htmlFor={inputId} className="label-premium">
          Nome da categoria *
        </label>
        <input
          id={inputId}
          className="input-premium"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex: Marketing"
          autoFocus
        />
        {createError && <p className="mt-2 text-xs text-danger">{createError}</p>}
      </Modal>
    </>
  )
}
