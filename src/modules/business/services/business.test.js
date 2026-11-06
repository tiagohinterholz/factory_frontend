import { describe, it, expect, vi, beforeEach } from "vitest"
import { api } from "@/api/http"
import { BusinessService } from "./business"

vi.mock("@/api/http", () => ({ api: { get: vi.fn(), post: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("BusinessService certificado digital", () => {
  it("getCertificate lê os metadados do certificado do próprio negócio", async () => {
    api.get.mockResolvedValue({ data: { installed: false } })

    const result = await BusinessService.getCertificate()

    expect(api.get).toHaveBeenCalledWith("/configuracoes/certificado/")
    expect(result).toEqual({ installed: false })
  })

  it("uploadCertificate envia multipart com os campos file e password", async () => {
    const body = { installed: true, holder_name: "OFICINA LTDA" }
    api.post.mockResolvedValue({ data: body })
    const file = new File(["pfx"], "certificado.pfx", { type: "application/x-pkcs12" })

    const result = await BusinessService.uploadCertificate(file, "segredo")

    expect(api.post).toHaveBeenCalledTimes(1)
    const [url, payload] = api.post.mock.calls[0]
    expect(url).toBe("/configuracoes/certificado/")
    expect(payload).toBeInstanceOf(FormData)
    expect(payload.get("file")).toBe(file)
    expect(payload.get("password")).toBe("segredo")
    expect(result).toEqual(body)
  })
})
