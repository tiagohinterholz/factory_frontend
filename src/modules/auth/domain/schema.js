import { z } from "zod"
import { emailField } from "@/modules/core/schemas/br-fields"
import {
  passwordFields,
  passwordFieldsDefaults,
  passwordsMatch,
  PASSWORD_MISMATCH_ISSUE,
} from "@/modules/core/schemas/password"

export const forgotPasswordSchema = z.object({ email: emailField })
export const forgotPasswordDefaults = { email: "" }

// tela aberta a partir do link do e-mail do ForgotPassword — mesmo
// formato de senha nova que a ativação de conta usa.
export const resetPasswordSchema = z
  .object({ ...passwordFields })
  .refine(passwordsMatch, PASSWORD_MISMATCH_ISSUE)

export const resetPasswordDefaults = { ...passwordFieldsDefaults }
