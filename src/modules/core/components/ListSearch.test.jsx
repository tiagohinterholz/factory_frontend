import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import ListSearch from "./ListSearch"

describe("<ListSearch>", () => {
  it("espera a pessoa parar de digitar antes de buscar", async () => {
    const onChange = vi.fn()
    renderWithProviders(<ListSearch onChange={onChange} delay={50} />)

    fireEvent.change(screen.getByLabelText("Busca rápida"), { target: { value: "ma" } })
    fireEvent.change(screen.getByLabelText("Busca rápida"), { target: { value: "mar" } })

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("mar"))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("não dispara busca ao montar e limpa com o X", async () => {
    const onChange = vi.fn()
    renderWithProviders(<ListSearch onChange={onChange} delay={10} />)
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText("Busca rápida"), { target: { value: "x" } })
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("x"))
    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }))

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(""))
  })
})
