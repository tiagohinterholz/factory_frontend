import {
  cnpjField,
  phoneField,
  emailField,
  optionalText,
  requiredText,
  requiredId,
} from "@/modules/core/schemas/br-fields"
import { z } from "zod"

// Backend (SupplierSerializer): business_id/state_id/city_id obrigatórios;
// cnpj/phone/email sempre validados (formato + unicidade no empreendimento);
// corporate_name/address/number obrigatórios; trade_name/complement opcionais.
export const supplierSchema = z.object({
  business_id: requiredId("Selecione o empreendimento"),
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

export const supplierDefaults = {
  business_id: "",
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
