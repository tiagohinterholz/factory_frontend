import { z } from "zod"

// Formatos que os validators do backend (apps/core/utils/validators.py) exigem.
export const CPF_RE = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
export const CNPJ_RE = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
export const PHONE_RE = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/
export const PLATE_RE = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}-\d[A-Z0-9]\d{2}$/

export const CPF_MASK = "___.___.___-__"
export const CNPJ_MASK = "__.___.___/____-__"
export const PHONE_MASK = "(__) _____-____"

export const cpfField = z.string().regex(CPF_RE, "CPF inválido. Formato: 000.000.000-00")
export const cnpjField = z.string().regex(CNPJ_RE, "CNPJ inválido. Formato: 00.000.000/0000-00")
export const phoneField = z.string().regex(PHONE_RE, "Telefone inválido. Formato: (00) 00000-0000")
export const emailField = z.email("E-mail inválido")

export const optionalText = z.string().trim().optional().default("")
export const requiredText = (message) => z.string().trim().min(1, message)
export const requiredId = (message = "Obrigatório") => z.string().trim().min(1, message)
