import { z } from "zod"
import { requiredId, requiredText, optionalText } from "@/modules/core/schemas/br-fields"

// Backend (AppointmentSerializer + Appointment model):
// business_id/client_id/vehicle_id/date obrigatórios;
// time/observation opcionais; order_id opcional e aceita null.
export const appointmentSchema = z.object({
  business_id: requiredId("Selecione o empreendimento"),
  client_id: requiredId("Selecione o cliente proprietário"),
  vehicle_id: requiredId("Selecione o veículo"),
  order_id: optionalText,
  date: requiredText("Informe a data"),
  time: optionalText,
  observation: optionalText,
})

export const appointmentDefaults = {
  business_id: "",
  client_id: "",
  vehicle_id: "",
  order_id: "",
  date: "",
  time: "",
  observation: "",
}

// form -> payload: order_id vazio vira null (o backend aceita null, mas não "");
// time vazio é omitido (campo opcional).
export function toAppointmentPayload(values) {
  const payload = { ...values, order_id: values.order_id || null }
  if (!payload.time) delete payload.time
  return payload
}
