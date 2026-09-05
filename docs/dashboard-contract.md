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

  "appointments": {
    "scheduled_this_week": [
      // um item por AGENDAMENTO da semana corrente (seg–dom)
      {
        "id": 1, // id do Appointment
        "client_id": 5,
        "client_name": "João Silva",
        "contact": "(51) 99999-9999", // Client.phone — pode ser null
        "vehicle_id": 3,
        "vehicle": "ABC1234 - Onix", // string já montada "placa - modelo"
        "date": "2026-09-07", // ISO date
        "time": "14:00:00", // ISO time, ou null se sem horário
        "order": 10, // id da OS vinculada, ou null — agendamento pode não ter OS
        "budget": null, // id do orçamento vinculado, ou null
      },
    ],
    "total_scheduled_this_week": 7, // int — total de clientes agendados na semana;
    //  exibido no canto direito do quadro "Atendimentos". Some se ausente.
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

- `financial` vem `null` para usuário não-admin. O frontend também esconde o
  quadro via `usePermissions().isAdmin` (defesa em profundidade).
- `appointments.scheduled_this_week[].order` e `.budget`: id do vínculo ou
  `null`. Um agendamento pode existir sem OS e sem orçamento. Quando `null`, o
  card mostra um atalho "Criar OS" / "Criar Orçamento" que abre o formulário de
  criação já com cliente e veículo pré-preenchidos; quando preenchido, linka
  para `/ordens/<id>` / `/orcamentos/<id>`. O card também aceita o vínculo
  como objeto aninhado (`{ "id": 10 }`) e o legado `order_id`.
- `time` e `contact` podem ser `null`; o card omite o horário / o telefone.
- Clicar no card abre a edição do agendamento (`/agendamentos/<id>`).
