import { useState } from "react"
import { useFinancialEntryEditForm } from "../hooks/useFinancialEntryEditForm"
import {
  FINANCIAL_ENTRY_CATEGORY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  financialEntryStatusTone,
  financialEntryCanAct,
  financialEntryTypeLabel,
  financialEntryCategoryLabel,
  paymentMethodLabel,
  paymentStatusTone,
  paymentIsActive,
} from "../domain"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MoneyField from "@/modules/core/components/MoneyField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { formatDate, formatDateTime } from "@/modules/core/utils/format"
import { CheckCircle, CreditCard, Wallet, XCircle } from "lucide-react"

export default function FinancialEntryEdit() {
  const {
    form,
    onSubmit,
    loading,
    entryType,
    status,
    paymentDate,
    cancelledAt,
    relatedOrder,
    payments,
    isAutomatic,
    handleMarkPaid,
    handleCancel,
    handleGenerateCharge,
    generatingCharge,
  } = useFinancialEntryEditForm()
  const [chargeMethod, setChargeMethod] = useState("PIX")
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  // travado (pago/cancelado): nunca edita, só exibe. Automático (nasceu de
  // faturamento/compra): só o vencimento é editável — o resto reflete o
  // evento real, mesma trava que o back aplica.
  const locked = !financialEntryCanAct(status)
  const fieldsLocked = locked || isAutomatic

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/financeiro" />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">Editar Lançamento</h1>
            <div className="flex items-center gap-3 mt-1 text-sm uppercase font-bold tracking-wider">
              <p className="text-slate-400">{financialEntryTypeLabel(entryType)}</p>
              <span className={`px-2 py-0.5 rounded-md ${financialEntryStatusTone(status)}`}>
                {status}
              </span>
            </div>
          </div>
          {financialEntryCanAct(status) && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleMarkPaid}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-sm shadow-sm transition-all"
              >
                <CheckCircle size={18} /> Marcar como pago
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm shadow-sm transition-all"
              >
                <XCircle size={18} /> Cancelar
              </button>
            </div>
          )}
        </div>

        {paymentDate && (
          <p className="text-[13px] text-slate-500 -mt-2 mb-4">
            Pago em {formatDate(paymentDate)}.
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
              {isAutomatic ? (
                // categoria automática (ex.: venda_servico) não existe na
                // lista de categorias manuais do <select> — mostrar como
                // texto fixo em vez de um <select> sem opção correspondente.
                <div className="flex flex-col">
                  <span className="label-premium">Categoria</span>
                  <p className="input-premium bg-ground text-muted cursor-not-allowed">
                    {financialEntryCategoryLabel(form.getValues("category"))}
                  </p>
                </div>
              ) : (
                <SelectField
                  label="Categoria"
                  options={FINANCIAL_ENTRY_CATEGORY_OPTIONS}
                  disabled={fieldsLocked}
                  error={errors.category?.message}
                  registration={register("category")}
                />
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

        {/* cobrança via gateway: só faz sentido pra receita vinculada a uma
            OS — mesma regra que o back aplica em payment_service. */}
        {entryType === "a_receber" && relatedOrder && (
          <div className="card-premium mt-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Cobrança</h3>
            </div>

            {!locked && !payments.some((payment) => paymentIsActive(payment.status)) && (
              <div className="flex flex-wrap items-end gap-4 mb-6 bg-slate-50 p-4 rounded-xl">
                <div className="flex-1 min-w-[180px]">
                  <SelectField
                    label="Forma de pagamento"
                    options={PAYMENT_METHOD_OPTIONS}
                    value={chargeMethod}
                    onChange={(event) => setChargeMethod(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateCharge(chargeMethod)}
                  disabled={generatingCharge}
                  className="px-4 py-3 bg-brand text-white rounded-xl hover:bg-brand-hover font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  Gerar cobrança
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-slate-700">
                      {paymentMethodLabel(payment.method)}
                    </span>
                    <span className="text-slate-400 ml-2">
                      {formatDateTime(payment.created_at)}
                    </span>
                    {payment.status === "falhou" && payment.error_message && (
                      <p className="text-xs text-danger mt-1">{payment.error_message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {payment.checkout_url && (
                      <a
                        href={payment.checkout_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand hover:underline text-xs font-bold"
                      >
                        Link de pagamento
                      </a>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${paymentStatusTone(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-slate-400 py-4 text-center">Nenhuma cobrança gerada ainda.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
