import { z } from "zod"
import { requiredId, optionalText } from "@/modules/core/schemas/br-fields"
import { fromDateTimeLocalInput } from "@/api/dto"

// Backend (BudgetSerializer): business_id/client_id/vehicle_id obrigatórios;
// valid_until é um DateTimeField opcional — quando não vem, o back usa
// hoje + 30 dias (por isso a tela de criação nem mostra o campo). status é
// controlado por ações (aprovar/cancelar) e não é enviado pelo formulário.
// budget_products / budget_services são sub-recursos (endpoints próprios).
export const budgetSchema = z.object({
  business_id: requiredId("Selecione o empreendimento"),
  client_id: requiredId("Selecione o cliente"),
  vehicle_id: requiredId("Selecione o veículo"),
  valid_until: optionalText,
})

export const budgetDefaults = {
  business_id: "",
  client_id: "",
  vehicle_id: "",
  valid_until: "",
}

// form -> payload: status fica de fora; valid_until (vindo de um
// <input type="datetime-local">) vira ISO 8601 com timezone, e some do payload
// quando vazio — deixando o back manter/aplicar o valor dele.
export function toBudgetPayload(values) {
  const payload = {
    business_id: values.business_id || null,
    client_id: values.client_id || null,
    vehicle_id: values.vehicle_id || null,
  }
  const validUntil = fromDateTimeLocalInput(values.valid_until)
  if (validUntil) payload.valid_until = validUntil
  return payload
}
