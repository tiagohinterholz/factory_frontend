import { z } from "zod"
import {
  cnpjField,
  phoneField,
  emailField,
  optionalText,
  requiredText,
  requiredId,
} from "@/modules/core/schemas/br-fields"

export const TAX_REGIME_OPTIONS = [
  { id: "simples_nacional", name: "Simples Nacional" },
  { id: "lucro_presumido", name: "Lucro Presumido" },
  { id: "lucro_real", name: "Lucro Real" },
  { id: "mei", name: "MEI" },
]

// Backend (BusinessSerializer): cnpj/phone/email sempre validados + únicos;
// address/number obrigatórios; state_id/city_id FKs. Campos fiscais opcionais
// (inscrições) + tax_regime com default Simples Nacional.
export const businessSchema = z.object({
  corporate_name: requiredText("Informe a razão social"),
  trade_name: optionalText,
  cnpj: cnpjField,
  state_registration: optionalText,
  municipal_registration: optionalText,
  tax_regime: z
    .enum(["simples_nacional", "lucro_presumido", "lucro_real", "mei"])
    .catch("simples_nacional"),
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
  state_registration: "",
  municipal_registration: "",
  tax_regime: "simples_nacional",
  state_id: "",
  city_id: "",
  address: "",
  number: "",
  complement: "",
  phone: "",
  email: "",
}
