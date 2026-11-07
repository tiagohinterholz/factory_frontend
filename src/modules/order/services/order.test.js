import { describe, it, expect, vi, beforeEach } from "vitest"
import { api } from "@/api/http"
import { OrderService } from "./order"

vi.mock("@/api/http", () => ({ api: { get: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("OrderService documentos fiscais", () => {
  it.each([
    ["getFiscalNoteDanfe", "/ordens/42/nota-fiscal/danfe/"],
    ["getFiscalNoteXml", "/ordens/42/nota-fiscal/xml/"],
    ["getServiceFiscalNoteDanfse", "/ordens/42/nota-fiscal-servico/danfse/"],
    ["getServiceFiscalNoteXml", "/ordens/42/nota-fiscal-servico/xml/"],
  ])("%s busca %s como blob", async (method, url) => {
    const blob = new Blob(["conteudo"])
    api.get.mockResolvedValue({ data: blob })

    const result = await OrderService[method](42)

    expect(api.get).toHaveBeenCalledWith(url, { responseType: "blob" })
    expect(result).toBe(blob)
  })
})
