import { describe, it, expect } from "vitest"
import { PASSWORD_RULES, passwordScore, generateStrongPassword } from "./password-policy"

describe("password-policy", () => {
  it("passwordScore conta quantas regras a senha atende", () => {
    expect(passwordScore("")).toBe(0)
    expect(passwordScore("abcdefgh")).toBe(2) // 8+ chars, minúscula
    expect(passwordScore("Abcdefg1!")).toBe(5)
  })

  it("generateStrongPassword sempre atende as 5 regras", () => {
    for (let i = 0; i < 20; i++) {
      const password = generateStrongPassword()
      PASSWORD_RULES.forEach((rule) => {
        expect(rule.test(password)).toBe(true)
      })
    }
  })

  it("generateStrongPassword respeita o tamanho pedido", () => {
    expect(generateStrongPassword(20)).toHaveLength(20)
  })
})
