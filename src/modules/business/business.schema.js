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

export const MAX_LOGO_MB = 5

// Backend (BusinessSerializer): cnpj/phone/email sempre validados + únicos;
// address/number obrigatórios; state_id/city_id FKs. Campos fiscais opcionais
// (inscrições) + tax_regime com default Simples Nacional.
// logo: ImageField opcional — usado nos relatórios. No form pode ser um File
// (upload novo), a URL atual (string, na edição) ou vazio.
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
  logo: z
    .any()
    .optional()
    .refine(
      (value) => !(value instanceof File) || value.type.startsWith("image/"),
      "O logo precisa ser um arquivo de imagem",
    )
    .refine(
      (value) => !(value instanceof File) || value.size <= MAX_LOGO_MB * 1024 * 1024,
      `A imagem deve ter no máximo ${MAX_LOGO_MB}MB`,
    ),
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
  logo: "",
}

// form -> payload. Só vira multipart quando há um arquivo NOVO de logo (o back
// recebe o upload junto do cadastro/edição). Sem arquivo novo, segue objeto
// JSON e o campo logo (URL atual ou vazio) fica de fora — não reenvia a
// string da imagem existente.
export function toBusinessPayload(values) {
  const { logo, ...rest } = values

  if (!(logo instanceof File)) return rest

  const formData = new FormData()
  Object.entries(rest).forEach(([key, value]) => {
    if (value != null && value !== "") formData.append(key, value)
  })
  formData.append("logo", logo)
  return formData
}
