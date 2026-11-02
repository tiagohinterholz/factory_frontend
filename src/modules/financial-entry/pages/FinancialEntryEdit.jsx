import { useState } from "react"
import { useFinancialEntryEditForm } from "../hooks/useFinancialEntryEditForm"
import {
  financialEntryStatusTone,
  financialEntryCanAct,
  financialEntryTypeLabel,
  financialEntryCategoryLabel,
} from "../domain"
import { paymentLabel } from "@/modules/order/domain"
import BackLink from "@/modules/core/components/BackLink"
import EntryClassificationFields from "../components/EntryClassificationFields"
import MarkEntryPaidDialog from "../components/MarkEntryPaidDialog"
import FormField from "@/modules/core/components/FormField"
import MoneyField from "@/modules/core/components/MoneyField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { formatDate, formatDateTime } from "@/modules/core/utils/format"
import { CheckCircle, Wallet, XCircle } from "lucide-react"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

export default function FinancialEntryEdit() {
  const {
    form,
    onSubmit,
    loading,
    entryId,
    entryType,
    status,
    paymentDate,
    paymentMethod,
    installments,
    cancelledAt,
    relatedOrder,
    isAutomatic,
    financialCategory,
    handleCancel,
    refetchMeta,
  } = useFinancialEntryEditForm()
  const [markingPaid, setMarkingPaid] = useState(false)
  const { canChangeFinancialEntry, canMarkFinancialEntryPaid, canCancelFinancialEntry } =
    usePermissions()
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  const actionable = financialEntryCanAct(status)
  const locked = !actionable || !canChangeFinancialEntry
  const fieldsLocked = locked || isAutomatic

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/financeiro" />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">
              {canChangeFinancialEntry ? "Editar Lançamento" : "Lançamento"}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm uppercase font-bold tracking-wider">
              <p className="text-slate-400">{financialEntryTypeLabel(entryType)}</p>
              <span className={`px-2 py-0.5 rounded-md ${financialEntryStatusTone(status)}`}>
                {status}
              </span>
            </div>
          </div>
          {actionable && (canMarkFinancialEntryPaid || canCancelFinancialEntry) && (
            <div className="flex flex-wrap gap-2">
              {canMarkFinancialEntryPaid && (
                <button
                  type="button"
                  onClick={() => setMarkingPaid(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-sm shadow-sm transition-all"
                >
                  <CheckCircle size={18} /> Marcar como pago
                </button>
              )}
              {canCancelFinancialEntry && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm shadow-sm transition-all"
                >
                  <XCircle size={18} /> Cancelar
                </button>
              )}
            </div>
          )}
        </div>

        {paymentDate && (
          <p className="text-[13px] text-slate-500 -mt-2 mb-4">
            Pago em {formatDate(paymentDate)}
            {paymentLabel({ payment_method: paymentMethod, installments }) &&
              ` via ${paymentLabel({ payment_method: paymentMethod, installments })}`}
            .
          </p>
        )}
        {cancelledAt && (
          <p className="text-[13px] text-slate-500 -mt-2 mb-4">
            Cancelado em {formatDateTime(cancelledAt)}.
          </p>
        )}
        {isAutomatic && relatedOrder && (
          <p className="text-[13px] text-slate-500 -mt-2 mb-4">
            Criado pelo faturamento da OS #{relatedOrder.id} — valor e categoria refletem a ordem,
            só o vencimento pode ser ajustado.
          </p>
        )}

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados do Lançamento</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fieldsLocked && (
                <div className="flex flex-col">
                  <span className="label-premium">Categoria</span>
                  <p className="input-premium bg-ground text-muted cursor-not-allowed">
                    {financialCategory?.name ??
                      financialEntryCategoryLabel(form.getValues("category"))}
                  </p>
                </div>
              )}
              <MoneyField
                control={control}
                name="amount"
                label="Valor"
                error={errors.amount?.message}
                disabled={fieldsLocked}
              />
            </div>

            <FormField
              label="Descrição"
              disabled={fieldsLocked}
              error={errors.description?.message}
              registration={register("description")}
            />

            <EntryClassificationFields
              form={form}
              categoryLocked={fieldsLocked}
              tagsLocked={locked}
              extraCategory={financialCategory}
            />

            <FormField
              label="Vencimento"
              type="date"
              disabled={locked}
              error={errors.due_date?.message}
              registration={register("due_date")}
            />

            {!locked && (
              <div className="pt-4 flex justify-end">
                <PrimaryButton type="submit" disabled={isSubmitting}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            )}
          </form>
        </div>
      </div>
      {canMarkFinancialEntryPaid && (
        <MarkEntryPaidDialog
          entry={markingPaid ? { id: entryId } : null}
          onClose={() => setMarkingPaid(false)}
          onMarked={() => refetchMeta()}
        />
      )}
    </div>
  )
}
