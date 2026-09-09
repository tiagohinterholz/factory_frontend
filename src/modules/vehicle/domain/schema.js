import { z } from "zod"
import { PLATE_RE, requiredText, requiredId, optionalText } from "@/modules/core/schemas/br-fields"

const CURRENT_YEAR = new Date().getFullYear()

// Backend (VehicleSerializer + Vehicle model):
// business_id/client_id obrigatórios; model/manufacturer obrigatórios;
// year 1940..ano atual; year_model 1940..ano atual + 1;
// plate obrigatória no formato AAA-1234 (antigo) ou AAA-1A23 (Mercosul), sempre maiúscula;
// fuel entre as choices do model; color/mileage opcionais.
const yearField = (max, message) =>
  z.coerce
    .number({ message: "Informe um ano válido" })
    .int("Informe um ano válido")
    .min(1940, "Ano deve ser a partir de 1940")
    .max(max, message)

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int("Valor inválido").min(0, "Valor inválido").optional(),
)

export const vehicleSchema = z.object({
  business_id: requiredId("Selecione o empreendimento"),
  client_id: requiredId("Selecione o cliente proprietário"),
  manufacturer: requiredText("Informe o fabricante"),
  model: requiredText("Informe o modelo"),
  year: yearField(CURRENT_YEAR, `Ano de fabricação não pode ser maior que ${CURRENT_YEAR}`),
  year_model: yearField(
    CURRENT_YEAR + 1,
    `Ano do modelo não pode ser maior que ${CURRENT_YEAR + 1}`,
  ),
  plate: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PLATE_RE, "Placa inválida. Formato: AAA-1234 ou AAA-1A23"),
  color: optionalText,
  fuel: requiredId("Selecione o combustível"),
  mileage: optionalNumber,
})

export const vehicleDefaults = {
  business_id: "",
  client_id: "",
  manufacturer: "",
  model: "",
  year: "",
  year_model: "",
  plate: "",
  color: "",
  fuel: "",
  mileage: "",
}
