# Contrato do `GET /dashboard/`

Consumido por `src/modules/dashboard`. O frontend tolera campos ausentes
(mostra zero / lista vazia / esconde o quadro), então back e front podem
entrar em releases separados.

```jsonc
{
  "activity": {
    "orders_to_bill_today": 3, // int — status "a faturar" E service_date = hoje
    "orders_to_bill": 12, // int — status "a faturar", qualquer data
    "orders_billed": 45, // int — status "faturado"
  },

  // Quadro "Atendimentos": só aguardando execução / em andamento.
  "appointments": {
    "scheduled_this_week": [
      // um item por AGENDAMENTO da semana corrente (seg–dom) SEM OS a
      // faturar/faturada vinculada (essas vão em `movements`, não aqui)
      {
        "id": 1, // id do Appointment
        "client_id": 5,
        "client_name": "João Silva",
        "contact": "(51) 99999-9999", // Client.phone — pode ser null
        "vehicle_id": 3,
        "vehicle": "ABC1234 - Onix", // string já montada "placa - modelo"
        "date": "2026-09-07", // ISO date
        "time": "14:00:00", // ISO time, ou null se sem horário
        "order_id": 10, // id da OS vinculada, ou null — agendamento pode não ter OS
        "order": {
          // objeto aninhado (OrderFlatSerializer) quando há OS, senão null
          "id": 10,
          "status": "em andamento",
          "service_date": "2026-09-07T14:00:00-03:00",
          "finished_service_date_at": null, // preenchido quando o serviço termina
          "total": "350.00",
        },
        "budget_id": null, // id do orçamento vinculado, ou null — sem objeto aninhado
      },
    ],
    "total_scheduled_this_week": 7, // int — total de clientes agendados na semana;
    //  exibido no canto direito do quadro "Atendimentos". Some se ausente.
  },

  // Quadro "Movimentação": só OS com serviço concluído — a faturar / faturado.
  // Mesmo shape de item de `appointments.scheduled_this_week` acima.
  "movements": {
    "bills_this_week": [
      {
        "id": 2,
        "client_id": 6,
        "client_name": "Maria Souza",
        "contact": "(51) 98888-8888",
        "vehicle_id": 9,
        "vehicle": "XYZ9876 - Gol",
        "date": "2026-09-10",
        "time": "09:00:00",
        "order_id": 50,
        "order": {
          "id": 50,
          "status": "a faturar",
          "service_date": "2026-09-10T09:00:00-03:00",
          "finished_service_date_at": "2026-09-10T15:00:00-03:00",
          "total": "820.00",
        },
        "budget_id": null,
      },
    ],
    "total_bills_this_week": 1, // int — total de OS a faturar/faturadas na semana
  },

  "financial": {
    // objeto inteiro null se o usuário NÃO for admin/superuser;
    //  checar `financial !== null` antes de ler os campos
    "to_bill_total": "1500.00", // decimal string — mês corrente
    "billed_total": "8200.00",
    "open_budgets_total": "900.00",
  },

  "summary": {
    // contagens gerais do empreendimento
    "clients": 15,
    "vehicles": 20,
    "suppliers": 10,
    "products": 25,
    "services": 10,
    "appointments": 40,
    "budgets": 25,
    "orders": 40,
  },
}
```

## Notas

- **`appointments` x `movements` já vêm separados pelo back** — o front não
  filtra mais por status no cliente. Antes (`scheduled_this_week` trazia tudo
  e o front separava por `appointmentStatusLabel`), agora cada quadro lê a
  chave certa direto: "Atendimentos" → `appointments.scheduled_this_week`,
  "Movimentação" → `movements.bills_this_week`.
- `financial` vem `null` para usuário não-admin. O frontend também esconde o
  quadro via `usePermissions().isAdmin` (defesa em profundidade).
- `order_id`/`order` e `budget_id`: um agendamento pode existir sem OS e sem
  orçamento (ambos `null`). Quando `order`/`budget` faltam, o card mostra um
  atalho "Criar OS" / "Criar Orçamento" que abre o formulário de criação já
  com cliente e veículo pré-preenchidos e o id do agendamento; ao salvar, o
  front faz `PATCH /agendamentos/<id>` com `{ order_id }` / `{ budget_id }`
  pra ligar o registro novo no agendamento. Quando preenchido, linka para
  `/ordens/<id>` / `/orcamentos/<id>`. O card também aceita o vínculo como id
  cru (legado: `order`/`budget` sendo o próprio id, não um objeto) — só
  `budget` nunca vem como objeto aninhado hoje, só `budget_id`.
- "Criar Orçamento" some quando o agendamento já tem OS — não faz sentido
  orçar uma OS que já existe (o link pro orçamento de origem, se houver,
  segue aparecendo).
- `order.finished_service_date_at`: quando presente, o card mostra "Finalizado
  em `<data>`" do lado do horário do agendamento.
- `time` e `contact` podem ser `null`; o card omite o horário / o telefone.
- Clicar no card abre a edição do agendamento (`/agendamentos/<id>`).
