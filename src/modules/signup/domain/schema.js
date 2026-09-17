import { z } from "zod"
import {
  cnpjField,
  emailField,
  phoneField,
  requiredId,
  requiredText,
} from "@/modules/core/schemas/br-fields"
import {
  passwordFields,
  passwordFieldsDefaults,
  passwordsMatch,
  PASSWORD_MISMATCH_ISSUE,
} from "@/modules/core/schemas/password"

// Backend (PublicSignupCreateSerializer): todos obrigatórios. period/method
// são validados contra o catálogo/choices do back também — a validação
// aqui é só pra UX (feedback na hora), a fonte de verdade continua lá.
// Um schema só pros dois passos do checkout: a submissão é um payload
// único, a paginação (conta -> empresa) é só do front (ver SignupCheckout).
export const signupSchema = z.object({
  email: emailField,
  responsible_name: requiredText("Informe seu nome"),
  corporate_name: requiredText("Informe a razão social"),
  cnpj: cnpjField,
  state_id: requiredId("Selecione o estado"),
  city_id: requiredId("Selecione a cidade"),
  address: requiredText("Informe o endereço"),
  number: requiredText("Informe o número"),
  phone: phoneField,
  period: requiredText("Selecione um plano"),
  method: requiredText("Selecione a forma de pagamento"),
})

export const signupDefaults = {
  email: "",
  responsible_name: "",
  corporate_name: "",
  cnpj: "",
  state_id: "",
  city_id: "",
  address: "",
  number: "",
  phone: "",
  period: "",
  method: "",
}

// campos validados antes de avançar do passo 1 (conta) pro passo 2
// (empresa) — ver form.trigger(SIGNUP_STEP_1_FIELDS) em SignupCheckout.
export const SIGNUP_STEP_1_FIELDS = ["email", "responsible_name"]

// tela de ativação (token do e-mail) — só define a senha
export const activateAccountSchema = z
  .object({ ...passwordFields })
  .refine(passwordsMatch, PASSWORD_MISMATCH_ISSUE)

export const activateAccountDefaults = { ...passwordFieldsDefaults }
