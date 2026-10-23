# Live Select (Cliente/Veículo) Specification

## Problem Statement

Todo campo de seleção do sistema hoje é um `<select>` nativo (`SelectField.jsx`) com a lista inteira carregada e sem busca — quem está lançando uma Ordem de Serviço, Orçamento ou Agendamento precisa rolar uma lista potencialmente longa de clientes/veículos pra achar o certo. Pior: quando o cliente ou veículo ainda não existe, a única saída hoje é abandonar o formulário em andamento, navegar pra uma tela de cadastro completa separada, cadastrar, e voltar pra recomeçar o formulário do zero — não existe nenhum atalho de "cadastro rápido sem sair da tela" em lugar nenhum do sistema hoje (confirmado por pesquisa no código).

## Goals

- [ ] Um componente reutilizável de seleção com busca (abre a lista ao clicar, filtra conforme digita) substitui o `<select>` nativo nos campos de Cliente e Veículo.
- [ ] Quando a busca não encontra o registro, a pessoa consegue cadastrar um novo (cliente ou veículo) num modal, sem sair nem perder o que já preencheu no formulário atual.
- [ ] O registro recém-criado já aparece selecionado no campo, sem passo extra.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Busca no servidor (debounce + endpoint de busca) | Decidido em Discuss — filtro é 100% em cima da lista já carregada hoje (`useClientOptions`/`useVehicleOptions`), sem mudança de backend. Só vale a pena se o volume de registros crescer muito (fica de nota pra revisar no futuro). |
| Estender pra Produto/Serviço/Fornecedor | Fora do P1 por decisão do usuário — vira feature própria depois (P2 do backlog maior). |
| Estender pra Categoria/Subcategoria, Marca/Modelo, Estado/Cidade | Fora do P1 — campos de cadastro menos usados no dia a dia, ficam pro P3 do backlog maior. |
| Mudar o comportamento de filtro veículo-por-cliente (hoje client-side) pra usar o filtro `client_id` que já existe no backend (`VehicleFilterSet`) | Não é bloqueador do P1 — o filtro atual já funciona, só não usa o endpoint; otimizar isso é independente desta feature. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Atalho de cadastro rápido | Modal inline, sem navegar pra outra página | Decidido em Discuss | y |
| Fonte da busca | Filtra em cima da lista já carregada (`useClientOptions`/`useVehicleOptions`), sem endpoint novo | Decidido em Discuss | y |
| Escopo do P1 | Só Cliente e Veículo | Decidido em Discuss | y |
| Campo mínimo do modal de cliente | PF: nome + sobrenome + CPF + estado + cidade + telefone. PJ: razão social + CNPJ + estado + cidade + telefone. `business_id` preenchido automaticamente (já é assim no cadastro completo hoje) | Grounded em `apps/customers/serializers/client_serializer.py` (PF/PJ obrigatórios) + `src/modules/client/domain/schema.js` (estado/cidade/telefone obrigatórios no front) | y |
| Campo mínimo do modal de veículo | client_id (pré-preenchido pelo cliente já selecionado no formulário-pai) + marca + modelo (cascata, igual ao cadastro completo) + ano + ano modelo + placa + combustível | Grounded em `apps/customers/models/vehicle.py` + `src/modules/vehicle/domain/schema.js` — nenhum desses é opcional em nenhuma das pontas | y |
| Veículo sem cliente selecionado ainda | O atalho "cadastrar veículo" fica desabilitado/pede primeiro escolher ou cadastrar o cliente, já que `client` é FK obrigatória do veículo | Consequência direta do modelo de dados — não dá pra criar veículo órfão | y |
| Critério de filtro por texto (cliente) | Compara contra nome/razão social E documento (CPF/CNPJ), case-insensitive, substring em qualquer posição | Busca por documento é um caso de uso real (cliente repetido lembra o CPF, não o nome) — enriquecimento razoável do "digita e filtra" pedido, não é escopo novo | y |
| Critério de filtro por texto (veículo) | Compara contra placa E marca+modelo, case-insensitive, substring em qualquer posição | Placa é o dado mais natural que um mecânico digitaria pra achar um veículo | y |
| Nenhum cliente/veículo cadastrado ainda (lista vazia) | O campo abre direto mostrando só o atalho "cadastrar novo", sem mensagem de "nenhum resultado" confusa | Evita UX ruim no primeiro uso do sistema (base vazia) | y |

**Open questions:** nenhuma pendente — todas as linhas acima já foram decididas em Discuss ou são consequência direta do modelo de dados existente.

---

## User Stories

### P1: Select com busca + cadastro rápido inline pra Cliente e Veículo ⭐ MVP

**User Story**: Como atendente/gerente lançando uma OS, orçamento ou agendamento, quero digitar pra achar o cliente/veículo rapidamente, e se ele não existir ainda, cadastrar ele ali mesmo sem perder o que já preenchi.

**Why P1**: É o maior ponto de atrito do fluxo diário (OS/Orçamento/Agendamento são as telas mais usadas) e a dor mais citada no pedido original. Entrega valor sozinho mesmo antes de estender pros outros campos (Produto/Serviço/Fornecedor).

**Acceptance Criteria**:

1. WHEN o usuário clica no campo Cliente (em Nova/Editar OS, Novo/Editar Orçamento, Novo/Editar Agendamento) THEN o sistema SHALL abrir uma lista com todos os clientes já carregados (mesma fonte de dado de hoje, `useClientOptions`) e um campo de texto no topo pra filtrar.
2. WHEN o usuário digita no campo de filtro THEN o sistema SHALL mostrar só os clientes cujo nome/razão social OU documento (CPF/CNPJ) contenha o texto digitado, sem diferenciar maiúscula/minúscula.
3. WHEN nenhum cliente bate com o texto digitado THEN o sistema SHALL mostrar uma opção "Cadastrar novo cliente" na lista.
4. WHEN o usuário aciona "Cadastrar novo cliente" THEN o sistema SHALL abrir um modal (sem navegar pra outra página, sem perder os outros campos já preenchidos no formulário atual) com os campos mínimos: tipo (PF/PJ), nome+sobrenome+CPF (PF) ou razão social+CNPJ (PJ), estado, cidade, telefone.
5. WHEN o modal de cliente é submetido com sucesso THEN o sistema SHALL criar o cliente pela API já existente, fechar o modal, selecionar o cliente novo no campo Cliente do formulário-pai, e atualizar a lista de opções de cliente.
6. WHEN o usuário clica no campo Veículo THEN o sistema SHALL abrir uma lista filtrada pelos veículos do cliente já selecionado no formulário (mesma regra client-side de hoje), com um campo de texto no topo pra filtrar por placa OU marca+modelo.
7. WHEN nenhum veículo do cliente selecionado bate com o texto digitado THEN o sistema SHALL mostrar uma opção "Cadastrar novo veículo".
8. WHEN o usuário aciona "Cadastrar novo veículo" E já existe um cliente selecionado no formulário-pai THEN o sistema SHALL abrir um modal com client_id pré-preenchido (não editável) e os campos marca (cascata pra modelo), modelo, ano, ano modelo, placa, combustível.
9. WHEN o usuário aciona "Cadastrar novo veículo" SEM nenhum cliente selecionado no formulário-pai THEN o sistema SHALL impedir a ação e indicar que é preciso escolher ou cadastrar o cliente primeiro.
10. WHEN o modal de veículo é submetido com sucesso THEN o sistema SHALL criar o veículo pela API já existente, fechar o modal, selecionar o veículo novo no campo Veículo do formulário-pai, e atualizar a lista de opções de veículo.

**Independent Test**: Numa Nova OS, digitar um nome de cliente que não existe no campo Cliente, clicar "Cadastrar novo cliente", preencher o mínimo, salvar, e confirmar que o cliente aparece selecionado na OS sem ter saído da tela — repetir o mesmo teste pro campo Veículo logo em seguida, usando o cliente recém-criado.

---

## Edge Cases

- WHEN a lista de clientes/veículos está vazia (base nova) THEN o sistema SHALL mostrar direto o atalho de cadastrar, sem mensagem de "nenhum resultado" por cima.
- WHEN o usuário troca o cliente selecionado no formulário-pai DEPOIS de já ter escolhido um veículo THEN o sistema SHALL limpar a seleção de veículo (ela pode não pertencer ao novo cliente) — decidido em Discuss.
- WHEN a criação do cliente/veículo no modal falha (erro de validação do backend) THEN o sistema SHALL mostrar o erro dentro do próprio modal, sem fechar, igual ao padrão de erro já usado nos formulários de cadastro completos hoje.
- WHEN o usuário fecha o modal de cadastro rápido sem salvar (Escape/clique fora/X) THEN o sistema SHALL simplesmente fechar o modal e manter o campo como estava antes (sem seleção), preservando o restante do formulário-pai intacto.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| LIVESEL-01 | P1 | Design | Pending |
| LIVESEL-02 | P1 | Design | Pending |
| LIVESEL-03 | P1 | Design | Pending |
| LIVESEL-04 | P1 | Design | Pending |
| LIVESEL-05 | P1 | Design | Pending |
| LIVESEL-06 | P1 | Design | Pending |
| LIVESEL-07 | P1 | Design | Pending |
| LIVESEL-08 | P1 | Design | Pending |
| LIVESEL-09 | P1 | Design | Pending |
| LIVESEL-10 | P1 | Design | Pending |

**Coverage:** 10 total, 0 mapped to tasks, 10 unmapped ⚠️ (normal nesta fase — Tasks ainda não rodou)

---

## Success Criteria

- [ ] Nenhum campo de Cliente/Veículo nas telas de OS/Orçamento/Agendamento usa mais o `<select>` nativo sem busca.
- [ ] É possível cadastrar cliente e veículo novos sem sair da tela de OS/Orçamento/Agendamento em nenhum momento.
- [ ] O componente de select com busca é genérico o bastante pra ser reaproveitado depois em Produto/Serviço/Fornecedor (P2 do backlog maior), sem reescrever do zero — confirmado no Design, não nesta spec.
