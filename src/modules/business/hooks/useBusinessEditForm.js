import { useState } from "react"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf } from "@/api/dto"
import { BusinessService } from "@/modules/business/services/business"
import { businessSchema, businessDefaults, toBusinessPayload, businessKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

function toBusinessForm(data) {
  return {
    corporate_name: data.corporate_name ?? "",
    trade_name: data.trade_name ?? "",
    cnpj: data.cnpj ?? "",
    state_registration: data.state_registration ?? "",
    municipal_registration: data.municipal_registration ?? "",
    tax_regime: data.tax_regime || "simples_nacional",
    state_id: idOf(data.state),
    city_id: idOf(data.city),
    address: data.address ?? "",
    number: data.number ?? "",
    complement: data.complement ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    // write-only: nunca vem no GET. O preview do logo atual vem de outro
    // lugar (useBusinessLogo, binário separado) — este campo só carrega
    // quando o usuário escolhe um arquivo novo pra trocar.
    logo: "",
  }
}

// Sem mais lista nem exclusão por aqui (excluir quebraria dados
// dependentes — só o superusuário mexe nisso, em outro lugar). Sem ID:
// /configuracoes/ é sempre "o meu negócio", resolvido pelo token. A tela
// abre em modo visualização; "Editar Empreendimento" libera o form inteiro
// (edição em bloco, não campo a campo) e "Salvar" grava tudo de uma vez e
// volta pro modo visualização, sem navegar pra outra página.
export function useBusinessEditForm() {
  const [editing, setEditing] = useState(false)

  const { form, onSubmit, loading } = useResourceForm({
    schema: businessSchema,
    defaultValues: businessDefaults,
    load: async () => toBusinessForm(await BusinessService.getSelf()),
    submit: (values) => BusinessService.updateSelf(toBusinessPayload(values)),
    invalidate: [businessKeys.all, dashboardKeys.all],
    onSuccess: () => setEditing(false),
    errorFallback: "Erro ao atualizar empreendimento",
  })

  function cancelEdit() {
    form.reset()
    setEditing(false)
  }

  return {
    form,
    onSubmit,
    loading,
    editing,
    startEdit: () => setEditing(true),
    cancelEdit,
  }
}
