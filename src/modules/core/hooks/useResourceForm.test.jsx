import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { z } from "zod"
import { ToastProvider } from "@/modules/core/feedback/ToastProvider"
import { useResourceForm } from "./useResourceForm"

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateSpy }
})

const schema = z.object({ name: z.string().min(1, "Obrigatório") })

const wrapper = ({ children }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}

// O formState do RHF é um proxy: só re-renderiza pros campos lidos durante o
// render. Tocar em `errors` aqui garante que o result.current acompanhe.
function useFormUnderTest(options) {
  const value = useResourceForm(options)
  void value.form.formState.errors
  return value
}

const render = (options) => renderHook(() => useFormUnderTest(options), { wrapper })

beforeEach(() => navigateSpy.mockClear())

describe("useResourceForm", () => {
  it("submit válido -> chama submit e navega", async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    const { result } = render({ schema, defaultValues: { name: "" }, submit, redirectTo: "/lista" })

    act(() => result.current.form.setValue("name", "Ana"))
    await act(async () => {
      await result.current.onSubmit()
    })

    expect(submit).toHaveBeenCalledWith({ name: "Ana" })
    expect(navigateSpy).toHaveBeenCalledWith("/lista")
  })

  it("submit inválido -> não chama submit, seta erro do schema", async () => {
    const submit = vi.fn()
    const { result } = render({ schema, defaultValues: { name: "" }, submit })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(submit).not.toHaveBeenCalled()
    expect(result.current.form.formState.errors.name?.message).toBe("Obrigatório")
  })

  it("erro do servidor por campo -> form.setError, sem navegar", async () => {
    const submit = vi.fn().mockRejectedValue({
      response: { status: 400, data: { name: ["Já existe."] } },
    })
    const { result } = render({ schema, defaultValues: { name: "" }, submit })

    act(() => result.current.form.setValue("name", "Ana"))
    await act(async () => {
      await result.current.onSubmit()
    })

    expect(result.current.form.formState.errors.name?.message).toBe("Já existe.")
    expect(navigateSpy).not.toHaveBeenCalled()
  })

  it("modo edit: load reseta o form", async () => {
    const { result } = render({
      schema,
      defaultValues: { name: "" },
      load: async () => ({ name: "Carregado" }),
      submit: vi.fn(),
    })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.form.getValues("name")).toBe("Carregado")
  })
})
