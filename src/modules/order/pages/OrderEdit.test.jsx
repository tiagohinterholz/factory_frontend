import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Routes, Route } from "react-router-dom"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import { API } from "@/test/msw/handlers"
import { renderWithProviders } from "@/test/render"
import OrderEdit from "./OrderEdit"
import { OrderService } from "../services/order"

// O orçamento de origem aparece só leitura (não é editável pela OS — o vínculo
// nasce ao aprovar o orçamento). billing_date também não tem campo: o back grava
// ao faturar e o front só exibe a tarja.
const order = {
  id: 1,
  business: { id: 2 },
  client: {
    id: 5,
    first_name: "Ana",
    last_name: "Lima",
    display_name: "Ana Lima",
    phone: "(41) 91234-5678",
  },
  vehicle: { id: 9, manufacturer: "VW", model: "Gol", plate: "ABC1D23" },
  budget: { id: 77 },
  service_date: null,
  billing_date: null,
  status: "em andamento",
  total: "6000.00",
  products_total: "5000.00",
  services_total: "1000.00",
  order_products: [],
  order_services: [],
}

function mockApi() {
  server.use(
    http.get(`${API}/ordens/1/`, () => HttpResponse.json(order)),
    http.get(`${API}/clientes/`, () =>
      HttpResponse.json({
        results: [
          { id: 5, first_name: "Ana", last_name: "Lima", display_name: "Ana Lima", business: 2 },
        ],
        count: 1,
      }),
    ),
    http.get(`${API}/veiculos/`, () =>
      HttpResponse.json({
        results: [
          {
            id: 9,
            client: 5,
            manufacturer: { id: 12, name: "VW" },
            model: { id: 55, name: "Gol" },
            plate: "ABC1D23",
          },
        ],
        count: 1,
      }),
    ),
    http.get(`${API}/produtos/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/servicos/`, () => HttpResponse.json({ results: [], count: 0 })),
    http.get(`${API}/financeiro/`, () => HttpResponse.json({ results: [], count: 0 })),
  )
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/ordens/:id" element={<OrderEdit />} />
    </Routes>,
    { route: "/ordens/1" },
  )

describe("<OrderEdit>", () => {
  it("mostra o orçamento de origem só leitura, sem <select> pra ele", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByText("Orçamento de origem")).toBeInTheDocument()
    expect(screen.getByText("Orçamento #77")).toBeInTheDocument()
    expect(screen.queryByRole("combobox", { name: /orçamento/i })).not.toBeInTheDocument()
  })

  it("botão de WhatsApp no header abre conversa com o telefone do cliente", async () => {
    mockApi()
    renderPage()

    await screen.findByText("Orçamento de origem")
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute(
      "href",
      "https://wa.me/5541912345678",
    )
  })

  it("cliente sem telefone: sem botão de WhatsApp", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({ ...order, client: { ...order.client, phone: null } }),
      ),
    )
    renderPage()

    await screen.findByText("Orçamento de origem")
    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument()
  })

  it("mostra o subtotal de produtos, o de serviços e o total geral do back", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByText("Subtotal produtos")).toBeInTheDocument()
    expect(screen.getByText("R$ 5.000,00")).toBeInTheDocument()
    expect(screen.getByText("Subtotal serviços")).toBeInTheDocument()
    expect(screen.getByText("R$ 1.000,00")).toBeInTheDocument()
    expect(screen.getByText("Total geral")).toBeInTheDocument()
    expect(screen.getByText("R$ 6.000,00")).toBeInTheDocument()
  })

  it("não tem campo de data de faturamento no form", async () => {
    mockApi()
    renderPage()

    await screen.findByText("Orçamento de origem")
    expect(screen.queryByLabelText(/faturamento/i)).not.toBeInTheDocument()
  })

  it("faturado: mostra a tarja 'Faturado em <data>' com o billing_date do back", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({ ...order, status: "faturado", billing_date: "2026-09-10" }),
      ),
    )
    renderPage()

    expect(await screen.findByText(/Faturado em 10\/09\/2026/)).toBeInTheDocument()
  })

  it("faturado: mostra link pro lançamento financeiro quando ele existe", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({ ...order, status: "faturado", billing_date: "2026-09-10" }),
      ),
      http.get(`${API}/financeiro/`, () => HttpResponse.json({ results: [{ id: 42 }], count: 1 })),
    )
    renderPage()

    const link = await screen.findByRole("link", { name: /Ver lançamento financeiro/i })
    expect(link).toHaveAttribute("href", "/financeiro/42")
  })

  it("faturado sem lançamento financeiro (dado antigo): não mostra o link", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({ ...order, status: "faturado", billing_date: "2026-09-10" }),
      ),
    )
    renderPage()

    await screen.findByText(/Faturado em 10\/09\/2026/)
    expect(
      screen.queryByRole("link", { name: /Ver lançamento financeiro/i }),
    ).not.toBeInTheDocument()
  })

  it("faturado: campos gerais e botão de salvar ficam desabilitados", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({ ...order, status: "faturado", billing_date: "2026-09-10" }),
      ),
    )
    renderPage()

    expect(await screen.findByText(/edição bloqueada/i)).toBeInTheDocument()
    const [clientSelect, vehicleSelect] = screen.getAllByRole("combobox")
    expect(clientSelect).toBeDisabled()
    expect(vehicleSelect).toBeDisabled()
    expect(screen.getByPlaceholderText("Digite o(a) data e hora do serviço")).toBeDisabled()
    expect(screen.getByPlaceholderText("Digite o(a) observações")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Atualizar OS" })).toBeDisabled()
  })

  it("em andamento: campos gerais e botão de salvar continuam editáveis", async () => {
    mockApi()
    renderPage()

    await screen.findByText("Orçamento de origem")
    const [clientSelect] = screen.getAllByRole("combobox")
    expect(clientSelect).toBeEnabled()
    expect(screen.getByRole("button", { name: "Atualizar OS" })).toBeEnabled()
  })

  it("mantém o client_id/vehicle_id no submit mesmo quando o cache de opções não traz o registro vinculado", async () => {
    mockApi()
    server.use(
      http.get(`${API}/clientes/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/veiculos/`, () => HttpResponse.json({ results: [], count: 0 })),
    )
    const update = vi.spyOn(OrderService, "updateOrder").mockResolvedValue(order)
    renderPage()

    await screen.findByText("Orçamento de origem")
    fireEvent.click(screen.getByRole("button", { name: "Atualizar OS" }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ client_id: "5", vehicle_id: "9" }),
      ),
    )
    update.mockRestore()
  })

  it("faturado com produto e serviço ativos: mostra os dois cartões de nota fiscal", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({
          ...order,
          status: "faturado",
          order_products: [
            { id: 1, quantity: 1, total: "10.00", is_active: true, product: { name: "Peça" } },
          ],
          order_services: [
            { id: 1, unit_price: "50.00", is_active: true, service: { name: "Troca de óleo" } },
          ],
        }),
      ),
      http.get(`${API}/ordens/1/nota-fiscal/`, () => HttpResponse.json(null, { status: 404 })),
      http.get(`${API}/ordens/1/nota-fiscal-servico/`, () =>
        HttpResponse.json(null, { status: 404 }),
      ),
    )
    renderPage()

    expect(await screen.findByText("Nota Fiscal (NF-e)")).toBeInTheDocument()
    expect(screen.getByText("Nota de Serviço (NFS-e)")).toBeInTheDocument()
  })

  it("faturado só com produto ativo: mostra só o cartão de nota fiscal de produto", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({
          ...order,
          status: "faturado",
          order_products: [
            { id: 1, quantity: 1, total: "10.00", is_active: true, product: { name: "Peça" } },
          ],
          order_services: [],
        }),
      ),
      http.get(`${API}/ordens/1/nota-fiscal/`, () => HttpResponse.json(null, { status: 404 })),
    )
    renderPage()

    expect(await screen.findByText("Nota Fiscal (NF-e)")).toBeInTheDocument()
    expect(screen.queryByText("Nota de Serviço (NFS-e)")).not.toBeInTheDocument()
  })

  it("faturado só com serviço ativo: mostra só o cartão de nota fiscal de serviço", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({
          ...order,
          status: "faturado",
          order_products: [],
          order_services: [
            { id: 1, unit_price: "50.00", is_active: true, service: { name: "Troca de óleo" } },
          ],
        }),
      ),
      http.get(`${API}/ordens/1/nota-fiscal-servico/`, () =>
        HttpResponse.json(null, { status: 404 }),
      ),
    )
    renderPage()

    expect(await screen.findByText("Nota de Serviço (NFS-e)")).toBeInTheDocument()
    expect(screen.queryByText("Nota Fiscal (NF-e)")).not.toBeInTheDocument()
  })

  it("não lista item com is_active=false (deletado que o back ainda devolve)", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({
          ...order,
          order_products: [
            {
              id: 1,
              quantity: 1,
              total: "10.00",
              is_active: true,
              product: { name: "Peça ativa" },
            },
            {
              id: 2,
              quantity: 1,
              total: "20.00",
              is_active: false,
              product: { name: "Peça deletada" },
            },
          ],
        }),
      ),
    )
    renderPage()

    expect(await screen.findByText(/Peça ativa/)).toBeInTheDocument()
    expect(screen.queryByText(/Peça deletada/)).not.toBeInTheDocument()
  })
})

describe("<OrderEdit> — finalizar serviço e trava de itens", () => {
  it("em andamento: mostra 'Finalizar serviço' e libera adicionar item", async () => {
    mockApi()
    renderPage()

    expect(await screen.findByRole("button", { name: /finalizar serviço/i })).toBeInTheDocument()
    expect(screen.getByText("Selecionar Produto")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Faturar OS" })).not.toBeInTheDocument()
  })

  it("finaliza o serviço pelo botão do header", async () => {
    mockApi()
    const finish = vi
      .spyOn(OrderService, "finishService")
      .mockResolvedValue({ status: "a faturar" })
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: /finalizar serviço/i }))
    fireEvent.click(await screen.findByRole("button", { name: "Finalizar" }))

    await waitFor(() => expect(finish).toHaveBeenCalledWith("1"))
    finish.mockRestore()
  })

  it("a faturar: itens travados e aparece 'Faturar OS'", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () => HttpResponse.json({ ...order, status: "a faturar" })),
    )
    renderPage()

    expect(await screen.findByText(/Itens travados/i)).toBeInTheDocument()
    expect(screen.queryByText("Selecionar Produto")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Faturar OS" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /finalizar serviço/i })).not.toBeInTheDocument()
  })
})

describe("<OrderEdit> — live-select de cliente/veículo", () => {
  it("mostra o cliente e o veículo já vinculados nos campos de busca", async () => {
    mockApi()
    renderPage()

    await screen.findByText("Orçamento de origem")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(clientInput).toHaveValue("Ana Lima"))
    await waitFor(() => expect(vehicleInput).toHaveValue("VW Gol"))
  })

  it("cliente/veículo vinculados mas desativados (fora da lista de opções) continuam visíveis no campo", async () => {
    mockApi()
    server.use(
      http.get(`${API}/clientes/`, () => HttpResponse.json({ results: [], count: 0 })),
      http.get(`${API}/veiculos/`, () => HttpResponse.json({ results: [], count: 0 })),
    )
    renderPage()

    await screen.findByText("Orçamento de origem")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(clientInput).toHaveValue("Ana Lima"))
    await waitFor(() => expect(vehicleInput).toHaveValue("VW Gol"))
  })

  it("trocar o cliente selecionado limpa o veículo já escolhido", async () => {
    mockApi()
    server.use(
      http.get(`${API}/clientes/`, () =>
        HttpResponse.json({
          results: [
            { id: 5, display_name: "Ana Lima", business: 2 },
            { id: 6, display_name: "Bruno Souza", business: 2 },
          ],
          count: 2,
        }),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("Orçamento de origem")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(vehicleInput).toHaveValue("VW Gol"))

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    expect(vehicleInput).toHaveValue("")
  })

  it("reselecionar o MESMO cliente não limpa o veículo já escolhido", async () => {
    mockApi()
    server.use(
      http.get(`${API}/clientes/`, () =>
        HttpResponse.json({
          results: [
            { id: 5, display_name: "Ana Lima", business: 2 },
            { id: 6, display_name: "Bruno Souza", business: 2 },
          ],
          count: 2,
        }),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("Orçamento de origem")
    const [clientInput, vehicleInput] = screen.getAllByRole("combobox")
    await waitFor(() => expect(vehicleInput).toHaveValue("VW Gol"))

    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Ana Lima" }))

    expect(vehicleInput).toHaveValue("VW Gol")
  })

  it("trocar o cliente realmente limpa o vehicle_id do form, não só o texto exibido", async () => {
    mockApi()
    server.use(
      http.get(`${API}/clientes/`, () =>
        HttpResponse.json({
          results: [
            { id: 5, display_name: "Ana Lima", business: 2 },
            { id: 6, display_name: "Bruno Souza", business: 2 },
          ],
          count: 2,
        }),
      ),
    )
    const update = vi.spyOn(OrderService, "updateOrder")
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("Orçamento de origem")
    const [clientInput] = screen.getAllByRole("combobox")
    await user.click(clientInput)
    await user.click(await screen.findByRole("option", { name: "Bruno Souza" }))

    fireEvent.click(screen.getByRole("button", { name: "Atualizar OS" }))

    expect(await screen.findByText("Selecione o veículo")).toBeInTheDocument()
    expect(update).not.toHaveBeenCalled()
    update.mockRestore()
  })

  describe("<OrderEdit> — fica na tela ao salvar", () => {
    it("salvar não volta pra listagem (OSFIN-P1-01)", async () => {
      mockApi()
      const update = vi.spyOn(OrderService, "updateOrder").mockResolvedValue(order)
      renderWithProviders(
        <Routes>
          <Route path="/ordens/:id" element={<OrderEdit />} />
          <Route path="/ordens" element={<h1>Lista de OS</h1>} />
        </Routes>,
        { route: "/ordens/1" },
      )

      await screen.findByText("Orçamento de origem")
      fireEvent.click(screen.getByRole("button", { name: "Atualizar OS" }))

      await waitFor(() => expect(update).toHaveBeenCalled())
      expect(screen.queryByRole("heading", { name: "Lista de OS" })).not.toBeInTheDocument()
      update.mockRestore()
    })
  })
})

describe("<OrderEdit> — faturamento", () => {
  it("OS faturada mostra como foi paga (OSFIN-P2-06)", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({
          ...order,
          status: "faturado",
          billing_date: "2026-09-10",
          payment: { payment_method: "pix", payment_method_display: "Pix", installments: null },
        }),
      ),
    )
    renderPage()

    expect(await screen.findByText("Pago: Pix")).toBeInTheDocument()
  })

  it("'Faturar OS' abre o pedido de forma de pagamento", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () => HttpResponse.json({ ...order, status: "a faturar" })),
    )
    renderPage()

    fireEvent.click(await screen.findByRole("button", { name: "Faturar OS" }))

    expect(await screen.findByRole("dialog", { name: "Faturar OS #1" })).toBeInTheDocument()
    expect(screen.getByLabelText(/forma de pagamento/i)).toBeInTheDocument()
  })
})

describe("<OrderEdit> — serviço personalizado", () => {
  it("lista o item personalizado pelo nome com a marca 'Personalizado'", async () => {
    mockApi()
    server.use(
      http.get(`${API}/ordens/1/`, () =>
        HttpResponse.json({
          ...order,
          order_services: [
            {
              id: 3,
              service: null,
              custom_name: "Solda no escapamento",
              name: "Solda no escapamento",
              unit_price: "80.00",
              is_active: true,
            },
          ],
        }),
      ),
    )
    renderPage()

    expect(await screen.findByText("Solda no escapamento")).toBeInTheDocument()
    expect(screen.getByText("Personalizado")).toBeInTheDocument()
  })

  it("adicionar personalizado chama a API com nome e valor", async () => {
    const user = userEvent.setup()
    mockApi()
    const create = vi.spyOn(OrderService, "orderServiceCreate").mockResolvedValue({})
    renderPage()

    await screen.findByText("Orçamento de origem")
    const serviceCombobox = screen.getAllByRole("combobox").at(-1)
    await user.click(serviceCombobox)
    await user.click(await screen.findByRole("option", { name: "Serviço personalizado" }))
    await user.type(screen.getByLabelText(/nome do serviço/i), "Revisão elétrica")
    await user.type(screen.getByLabelText(/valor \(r\$\)/i), "90")
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }))

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith("1", {
        custom_name: "Revisão elétrica",
        unit_price: "90.00",
        order_id: "1",
      }),
    )
    create.mockRestore()
  })
})
