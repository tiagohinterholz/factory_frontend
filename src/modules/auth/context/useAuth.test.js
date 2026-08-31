import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { AuthProvider } from "./AuthProvider"
import { useAuth } from "./auth-context"

const wrapper = AuthProvider

describe("useAuth", () => {
  it("lança fora do <AuthProvider>", () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/)
  })

  it("re-hidrata o usuário do localStorage no mount", () => {
    localStorage.setItem("user", JSON.stringify({ email: "a@a.com", business_id: 7 }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user.email).toBe("a@a.com")
  })

  it("sem business_id -> superusuário", () => {
    localStorage.setItem("user", JSON.stringify({ email: "s@s.com" }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isSuperUser).toBe(true)
    expect(result.current.businessId).toBe(null)
  })

  it("com business_id -> não é superusuário", () => {
    localStorage.setItem("user", JSON.stringify({ email: "c@c.com", business_id: 3 }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isSuperUser).toBe(false)
    expect(result.current.businessId).toBe(3)
  })

  it("login() grava a sessão e seta o user", async () => {
    // o backend não devolve mais `refresh` no corpo (vai no cookie HttpOnly)
    server.use(
      http.post(`${API}/usuarios/login/`, () =>
        HttpResponse.json({ access: "AT", email: "x@x.com", business_id: 9 }),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: "x@x.com", password: "p" })
    })

    expect(result.current.user.email).toBe("x@x.com")
    expect(result.current.isAuthenticated).toBe(true)
    expect(localStorage.getItem("access")).toBe("AT")
    expect(localStorage.getItem("refresh")).toBe(null)
  })

  it("logout() limpa a sessão", async () => {
    localStorage.setItem("access", "AT")
    localStorage.setItem("user", JSON.stringify({ email: "y@y.com" }))
    server.use(http.post(`${API}/usuarios/logout/`, () => new HttpResponse(null, { status: 204 })))

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBe(null)
    expect(localStorage.getItem("access")).toBe(null)
    expect(localStorage.getItem("user")).toBe(null)
  })
})
