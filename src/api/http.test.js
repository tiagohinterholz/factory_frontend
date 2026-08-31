import { describe, it, expect } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { api } from "./http"
import { authStorage } from "./auth-storage"

describe("http interceptors", () => {
  it("anexa Authorization do authStorage no request", async () => {
    authStorage.setAccess("TOK")
    server.use(
      http.get(`${API}/ping`, ({ request }) =>
        HttpResponse.json({ auth: request.headers.get("Authorization") }),
      ),
    )

    const { data } = await api.get("/ping")
    expect(data.auth).toBe("Bearer TOK")
  })

  it("401 -> um refresh -> repete o request e resolve", async () => {
    authStorage.setSession({ access: "OLD" })
    let refreshCalls = 0
    server.use(
      http.get(`${API}/protected`, ({ request }) =>
        request.headers.get("Authorization") === "Bearer NEW"
          ? HttpResponse.json({ ok: true })
          : new HttpResponse(null, { status: 401 }),
      ),
      http.post(`${API}/usuarios/refresh-token/`, () => {
        refreshCalls++
        return HttpResponse.json({ access: "NEW" })
      }),
    )

    const { data } = await api.get("/protected")
    expect(data.ok).toBe(true)
    expect(refreshCalls).toBe(1)
    expect(authStorage.getAccess()).toBe("NEW")
  })

  it("401 simultâneos -> apenas UM refresh (single-flight)", async () => {
    authStorage.setSession({ access: "OLD" })
    let refreshCalls = 0
    server.use(
      http.get(`${API}/protected`, ({ request }) =>
        request.headers.get("Authorization") === "Bearer NEW"
          ? HttpResponse.json({ ok: true })
          : new HttpResponse(null, { status: 401 }),
      ),
      http.post(`${API}/usuarios/refresh-token/`, () => {
        refreshCalls++
        return HttpResponse.json({ access: "NEW" })
      }),
    )

    const results = await Promise.all([
      api.get("/protected"),
      api.get("/protected"),
      api.get("/protected"),
    ])
    expect(results.every((r) => r.data.ok)).toBe(true)
    expect(refreshCalls).toBe(1)
  })

  it("refresh falha -> limpa a sessão", async () => {
    // O redirect (window.location.href = "/") não é asserido: mexer em
    // window.location no jsdom quebra o XHR. A limpeza já prova que o catch rodou.
    authStorage.setSession({ access: "OLD", user: { email: "a@a" } })
    server.use(
      http.get(`${API}/protected`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${API}/usuarios/refresh-token/`, () => new HttpResponse(null, { status: 401 })),
    )

    await expect(api.get("/protected")).rejects.toBeDefined()
    expect(authStorage.getAccess()).toBe(null)
    expect(authStorage.getUser()).toBe(null)
  })

  it("erro não-401 passa direto, sem refresh", async () => {
    authStorage.setSession({ access: "OLD" })
    let refreshCalls = 0
    server.use(
      http.get(`${API}/boom`, () => new HttpResponse(null, { status: 500 })),
      http.post(`${API}/usuarios/refresh-token/`, () => {
        refreshCalls++
        return HttpResponse.json({ access: "NEW" })
      }),
    )

    await expect(api.get("/boom")).rejects.toMatchObject({ response: { status: 500 } })
    expect(refreshCalls).toBe(0)
  })
})
