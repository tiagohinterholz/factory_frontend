// Política de senha forte — espelha exatamente
// apps/core/utils/validators.py::validate_strong_password do backend, chamada
// tanto no create quanto no validate_password do serializer (roda no PATCH
// também, mas só se o campo `password` vier no payload — em branco não valida
// e mantém a senha atual, é isso que toUserEditPayload assume).
// Fonte única pra validação (zod, em user.schema.js) e pro medidor visual/
// gerador (PasswordStrengthMeter / PasswordFields), pra nunca dessincronizar.
export const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_RULES = [
  {
    id: "length",
    label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  { id: "upper", label: "1 letra maiúscula", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "1 letra minúscula", test: (value) => /[a-z]/.test(value) },
  { id: "digit", label: "1 número", test: (value) => /\d/.test(value) },
  {
    id: "special",
    label: "1 caractere especial (!@#$%...)",
    test: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
]

export function passwordScore(value) {
  return PASSWORD_RULES.reduce((score, rule) => score + (rule.test(value) ? 1 : 0), 0)
}

// Pools sem caracteres ambíguos (0/O, 1/l/I) — pra senha gerada dar pra
// digitar/ler sem confusão quando precisar passar por telefone, por exemplo.
const LOWER = "abcdefghijkmnpqrstuvwxyz"
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"
const DIGITS = "23456789"
const SPECIAL = "!@#$%^&*"
const ALL = LOWER + UPPER + DIGITS + SPECIAL

function randomChar(pool) {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return pool[bytes[0] % pool.length]
}

// Gera uma senha que sempre bate com PASSWORD_RULES: garante 1 caractere de
// cada categoria e embaralha (Fisher-Yates) com crypto.getRandomValues.
export function generateStrongPassword(length = 14) {
  const required = [LOWER, UPPER, DIGITS, SPECIAL].map(randomChar)
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => randomChar(ALL))
  const chars = [...required, ...rest]

  for (let i = chars.length - 1; i > 0; i--) {
    const bytes = new Uint32Array(1)
    crypto.getRandomValues(bytes)
    const j = bytes[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join("")
}
