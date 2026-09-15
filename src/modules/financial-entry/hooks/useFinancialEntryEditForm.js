import { useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { toDateInput } from "@/api/dto"
import { FinancialEntryService } from "@/modules/financial-entry/services/financial-entry"
import { dashboardKeys } from "@/modules/dashboard/domain"
import {
  financialEntryEditSchema,
  toFinancialEntryUpdatePayload,
  financialEntryKeys,
  financialEntryIsAutomatic,
} from "../domain"

// dto da API -> shape do form. entry_type nunca é editável (trocar de pagar
// pra receber depois de criado é sinal de erro, cancela e recria) — fica só
// no meta, pra exibição.
function toFinancialEntryForm(data) {
  return {
    category: data.category ?? "",
    description: data.description ?? "",
    amount: data.amount ?? "",
    due_date: toDateInput(data.due_date),
  }
}

export function useFinancialEntryEditForm() {
  const { id } = useParams()

  // status, tipo, vínculo de origem e datas de ação são somente leitura
  // aqui; vivem fora do form.
  const [meta, setMeta] = useState({
    entryType: "",
    status: "",
    paymentDate: null,
    cancelledAt: null,
    order: null,
    supplier: null,
  })

  const fetchMeta = useCallback(async () => {
    const data = await FinancialEntryService.getFinancialEntryById(id)
    setMeta({
      entryType: data.entry_type ?? "",
      status: data.status ?? "",
      paymentDate: data.payment_date ?? null,
      cancelledAt: data.cancelled_at ?? null,
      order: data.order ?? null,
      supplier: data.supplier ?? null,
    })
    return data
  }, [id])

  const isAutomatic = financialEntryIsAutomatic(meta)

  const { form, onSubmit, loading } = useResourceForm({
    schema: financialEntryEditSchema,
    defaultValues: {
      category: "",
      description: "",
      amount: "",
      due_date: "",
    },
    load: async () => toFinancialEntryForm(await fetchMeta()),
    submit: (values) =>
      FinancialEntryService.updateFinancialEntry(
        id,
        toFinancialEntryUpdatePayload(values, financialEntryIsAutomatic(meta)),
      ),
    redirectTo: "/financeiro",
    invalidate: [financialEntryKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar o lançamento",
  })

  const markPaid = useResourceAction({
    mutationFn: () => FinancialEntryService.markFinancialEntryPaid(id),
    confirm: {
      title: "Marcar como pago?",
      message: "O lançamento será marcado como pago hoje.",
      confirmText: "Marcar como pago",
    },
    invalidate: [financialEntryKeys.all, dashboardKeys.all],
    success: "Lançamento marcado como pago.",
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao marcar o lançamento como pago.",
  })

  const cancel = useResourceAction({
    mutationFn: () => FinancialEntryService.cancelFinancialEntry(id),
    confirm: {
      title: "Cancelar lançamento?",
      message: "O lançamento será marcado como cancelado — não pode ser desfeito.",
      confirmText: "Sim, cancelar",
      danger: true,
    },
    invalidate: [financialEntryKeys.all, dashboardKeys.all],
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao cancelar o lançamento.",
  })

  return {
    form,
    onSubmit,
    loading,
    entryType: meta.entryType,
    status: meta.status,
    paymentDate: meta.paymentDate,
    cancelledAt: meta.cancelledAt,
    relatedOrder: meta.order,
    relatedSupplier: meta.supplier,
    isAutomatic,
    handleMarkPaid: markPaid.run,
    handleCancel: cancel.run,
  }
}
