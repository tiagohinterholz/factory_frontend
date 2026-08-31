import { z } from "zod"
import { requiredId, optionalText } from "@/modules/core/schemas/br-fields"

// Backend (BudgetSerializer): business_id/client_id/vehicle_id obrigatórios;
// valid_until opcional (aceita null); status é controlado por ações
// (aprovar/cancelar) e não é enviado pelo formulário.
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

// form -> payload: valid_until vazio vira null; status fica de fora.
export function toBudgetPayload(values) {
  return {
    business_id: values.business_id || null,
    client_id: values.client_id || null,
    vehicle_id: values.vehicle_id || null,
    valid_until: values.valid_until || null,
  }
}
