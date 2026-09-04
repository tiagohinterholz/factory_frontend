import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test/render"
import BusinessHoursPanel from "./BusinessHoursPanel"

const hours = [
  {
    id: 1,
    weekday: 0,
    weekday_display: "Segunda-feira",
    opens_at: "08:00:00",
    closes_at: "17:00:00",
    is_closed: false,
  },
  {
    id: 7,
    weekday: 6,
    weekday_display: "Domingo",
    opens_at: null,
    closes_at: null,
    is_closed: true,
  },
]

describe("<BusinessHoursPanel>", () => {
  it("colaborador (canEdit=false) só visualiza os horários, sem controles de edição", () => {
    renderWithProviders(
      <BusinessHoursPanel hours={hours} loading={false} canEdit={false} onSave={vi.fn()} />,
    )

    expect(screen.getByText("Segunda-feira")).toBeInTheDocument()
    expect(screen.getByText("08:00 às 17:00")).toBeInTheDocument()
    expect(screen.getByText("Domingo")).toBeInTheDocument()
    expect(screen.getByText("Fechado")).toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    expect(screen.queryByTitle("Salvar horário")).not.toBeInTheDocument()
  })

  it("admin edita um horário e salva com os campos alterados", async () => {
    const onSave = vi.fn().mockResolvedValue()
    renderWithProviders(
      <BusinessHoursPanel hours={hours} loading={false} canEdit onSave={onSave} />,
    )

    const timeInputs = screen.getAllByDisplayValue("08:00")
    fireEvent.change(timeInputs[0], { target: { value: "09:00" } })

    const saveButtons = screen.getAllByTitle("Salvar horário")
    fireEvent.click(saveButtons[0])

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(0, {
        is_closed: false,
        opens_at: "09:00:00",
        closes_at: "17:00:00",
      }),
    )
  })

  it("marcar como fechado e salvar envia só is_closed", async () => {
    const onSave = vi.fn().mockResolvedValue()
    renderWithProviders(
      <BusinessHoursPanel hours={hours} loading={false} canEdit onSave={onSave} />,
    )

    const checkboxes = screen.getAllByRole("checkbox")
    fireEvent.click(checkboxes[0])

    const saveButtons = screen.getAllByTitle("Salvar horário")
    fireEvent.click(saveButtons[0])

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(0, { is_closed: true }))
  })

  it("não salva e mostra erro quando desmarca fechado sem informar os horários", async () => {
    const onSave = vi.fn()
    renderWithProviders(
      <BusinessHoursPanel hours={hours} loading={false} canEdit onSave={onSave} />,
    )

    const checkboxes = screen.getAllByRole("checkbox")
    fireEvent.click(checkboxes[1]) // desmarca "Fechado" do domingo

    const saveButtons = screen.getAllByTitle("Salvar horário")
    fireEvent.click(saveButtons[1])

    expect(
      await screen.findByText(/informe abertura e fechamento, ou marque como fechado/i),
    ).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })
})
