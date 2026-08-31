import { z } from "zod"
import {
  cnpjField,
  phoneField,
  emailField,
  optionalText,
  requiredText,
  requiredId,
} from "@/modules/core/schemas/br-fields"

// Backend (BusinessSerializer): cnpj/phone/email sempre validados + únicos;
// address/number obrigatórios; state_id/city_id FKs.
export const businessSchema = z.object({
  corporate_name: requiredText("Informe a razão social"),
  trade_name: optionalText,
  cnpj: cnpjField,
  state_id: requiredId("Selecione o estado"),
  city_id: requiredId("Selecione a cidade"),
  address: requiredText("Informe o endereço"),
  number: requiredText("Informe o número"),
  complement: optionalText,
  phone: phoneField,
  email: emailField,
})

export const businessDefaults = {
  corporate_name: "",
  trade_name: "",
  cnpj: "",
  state_id: "",
  city_id: "",
  address: "",
  number: "",
  complement: "",
  phone: "",
  email: "",
}
