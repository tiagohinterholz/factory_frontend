import { useFinancialEntryForm } from "../hooks/useFinancialEntryForm"
import { FINANCIAL_ENTRY_TYPE_OPTIONS, FINANCIAL_ENTRY_CATEGORY_OPTIONS } from "../domain"
import BackLink from "@/modules/core/components/BackLink"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MoneyField from "@/modules/core/components/MoneyField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Wallet, Save } from "lucide-react"

export default function FinancialEntryCreate() {
  const { form, onSubmit } = useFinancialEntryForm()
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/financeiro" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Lançamento</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Despesa ou receita sem origem automática — aluguel, folha de pagamento ou outro.
        </p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados do Lançamento</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Tipo"
                options={FINANCIAL_ENTRY_TYPE_OPTIONS}
                error={errors.entry_type?.message}
                registration={register("entry_type")}
              />
              <SelectField
                label="Categoria"
                options={FINANCIAL_ENTRY_CATEGORY_OPTIONS}
                error={errors.category?.message}
                registration={register("category")}
              />
            </div>

            <FormField
              label="Descrição"
              placeholder="Ex: Aluguel de outubro"
              error={errors.description?.message}
              registration={register("description")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MoneyField
                control={control}
                name="amount"
                label="Valor"
                error={errors.amount?.message}
              />
              <FormField
                label="Vencimento"
                type="date"
                error={errors.due_date?.message}
                registration={register("due_date")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Criar Lançamento
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
