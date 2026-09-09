import { z } from "zod"
import { requiredId, optionalText } from "@/modules/core/schemas/br-fields"
import { fromDateTimeLocalInput } from "@/api/dto"

// Backend (OrderSerializer): business_id/client_id/vehicle_id aceitam null no PATCH,
// mas o model exige as três FKs -> obrigatórias no form.
// service_date/notes são opcionais. status e billing_date são controlados por
// ações (faturar) e não vão no formulário. budget também fica de fora: o vínculo
// é criado ao aprovar o orçamento e não deve ser mexido pela edição da OS.
// order_products / order_services são sub-recursos (endpoints próprios).
//
// service_date é DateTimeField (ISO 8601 com timezone). O form usa
// <input type="datetime-local">; sempre mandar com hora — se mandar só a data,
// o back grava meia-noite. Mudar service_date sincroniza o agendamento
// vinculado (cria/move); mandar null não mexe no agendamento.
export const orderSchema = z.object({
  business_id: requiredId("Selecione o empreendimento"),
  client_id: requiredId("Selecione o cliente"),
  vehicle_id: requiredId("Selecione o veículo"),
  service_date: optionalText,
  notes: optionalText,
})

export const orderDefaults = {
  business_id: "",
  client_id: "",
  vehicle_id: "",
  service_date: "",
  notes: "",
}

// form -> payload: campos vazios viram null (o backend aceita). status,
// billing_date e budget_id ficam de fora — não são editáveis pela OS.
// service_date (do <input type="datetime-local">) vira ISO 8601 com timezone.
export function toOrderPayload(values) {
  return {
    business_id: values.business_id || null,
    client_id: values.client_id || null,
    vehicle_id: values.vehicle_id || null,
    service_date: fromDateTimeLocalInput(values.service_date),
    notes: values.notes || null,
  }
}
