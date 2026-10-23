# Cliente/Veículo/Fornecedor/Produto UX Specification

## Problem Statement

Os fluxos de cadastro de Cliente, Veículo, Fornecedor e Produto/Serviço têm uma série de atritos acumulados: toda ação de salvar manda pra listagem em vez de deixar continuar de onde parou (impedindo, por exemplo, cadastrar um cliente e já adicionar o veículo dele em seguida); botões sem rótulo; cards de "relacionados" (veículos do cliente, produtos/serviços do fornecedor) que não levam a lugar nenhum quando clicados; falta de atalho de WhatsApp em fornecedor/produto pra pedido de compra; estoque negativo sem destaque visual; e o cadastro de produto/serviço não tem um jeito rápido de registrar a saída financeira correspondente nem prioriza o próprio estabelecimento como fornecedor nos selects.

## Goals

- [ ] Nenhuma ação de salvar (criar/editar) em Cliente/Veículo/Fornecedor manda mais pra listagem — fica no próprio registro ou volta pra onde a ação começou.
- [ ] Os cards de "relacionados" (veículos do cliente, produtos/serviços do fornecedor) viram links de verdade pros registros que mostram.
- [ ] Fornecedor e Produto ganham atalho de WhatsApp pra pedido de compra, reaproveitando o padrão que já existe em Cliente/Agendamento/OS.
- [ ] Estoque negativo/zerado tem destaque visual próprio, distinto do aviso de "abaixo do mínimo" que já existe.
- [ ] Cadastro de Produto/Serviço usa o select com busca (`LiveSelect`, da feature `live-select`) no campo Fornecedor, com o próprio estabelecimento aparecendo primeiro na lista.

## Out of Scope

| Feature                                                                                                                       | Reason                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Busca no servidor pros selects com busca desta feature                                                                        | Mesma decisão já tomada na feature `live-select` — reaproveita o primitivo client-side, sem endpoint novo. |
| Mudar a regra de negócio de quando o estoque é descontado (continua no momento de adicionar o item na OS, não no faturamento) | Já esclarecido e descartado numa conversa anterior — não é mais parte de pedido nenhum.                    |
| Fluxo completo de "fornecedor de serviço terceirizado" na OS (modal perguntando se quer lançar saída financeira ao faturar)   | Pertence à feature de Orçamento/OS + Financeiro (bloco separado), não a esta.                              |
| Catálogo de categoria/subcategoria do financeiro                                                                              | Pertence à feature de Orçamento/OS + Financeiro.                                                           |

---

## Assumptions & Open Questions

| Assumption / decision                                                                       | Chosen default                                                                                                                                                                                                                                                                                                                           | Rationale                                                                                                                                                                                                                               | Confirmed?                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Máscara de placa cobre os dois formatos (antigo ABC-1234 e Mercosul ABC1D23)                | Máscara dinâmica que decide o padrão pelo 5º caractere digitado (letra → Mercosul, dígito → antigo), em vez de uma máscara fixa única                                                                                                                                                                                                    | O regex de validação (`PLATE_RE`) já aceita os dois formatos — a máscara visual deveria acompanhar, não travar num só                                                                                                                   | n — nenhuma pergunta direta foi feita sobre isso; sinalizado aqui como decisão técnica razoável, não um gray area de UX que precisasse de pergunta |
| Modal "registrar saída financeira" ao cadastrar Produto                                     | Pergunta Sim/Não logo após salvar o produto, valor sugerido = custo × quantidade inicial (se informada), usando a MESMA chamada de API que já existe pra criar `FinancialEntry` (sem endpoint novo)                                                                                                                                      | Não existe nenhum precedente desse "modal pós-save pergunta se quer criar outro registro" no código — é padrão novo, melhor cobrir com o jeito mais simples possível (sim/não) do que inventar fluxo mais complexo sem pedido explícito | y (confirmado como pedido original, mecanismo é decisão da spec)                                                                                   |
| Destaque de estoque negativo/zero coexiste com o aviso de "abaixo do mínimo" já existente   | Zero ou negativo ganha um estilo mais forte (vermelho + ícone, igual ao de "abaixo do mínimo" mas numa variação visual distinta, ex. fundo vermelho sutil em vez de só texto vermelho) só quando `stock_quantity <= 0`; entre 0 e o mínimo continua só o aviso de hoje                                                                   | Os dois avisos têm significado diferente (zero/negativo é mais grave que "só abaixo do mínimo") e podem ocorrer ao mesmo tempo                                                                                                          | y                                                                                                                                                  |
| Mensagem do WhatsApp de "pedido de compra"                                                  | Texto padrão tipo "Olá! Gostaria de solicitar a compra/reposição do produto {nome do produto}." pré-preenchido no link `wa.me`, editável pelo usuário antes de enviar (o WhatsApp já abre com o texto no campo, não envia sozinho)                                                                                                       | Consistente com o `whatsappLink()` já existente, que só monta o link — quem decide mandar é o usuário, sempre                                                                                                                           | y                                                                                                                                                  |
| Cartão "Abrir Orçamento"/"Abrir OS" na edição de Veículo                                    | Fica como P3, registrado mas com pesquisa de embasamento incompleta — a tela de edição de Veículo hoje não tem nenhum card de orçamento/OS vinculado (nem um placeholder como o de Cliente); a spec assume que esse card precisa ser criado do zero (buscar orçamentos/OS pelo veículo), não só "destravar" algo que já existe escondido | n — não foi perguntado nem pesquisado a fundo; fica marcado para confirmação/pesquisa adicional antes do Design avançar nesse item específico                                                                                           |
| Identificação do "fornecedor-espelho" (o próprio estabelecimento) nos selects de Fornecedor | Usa o mesmo CNPJ do `Business` pra encontrar o `Supplier`-espelho já criado automaticamente em `business_service.create()`, e ordena ele primeiro na lista de opções                                                                                                                                                                     | É o mesmo registro que já existe hoje (criado automaticamente pra todo negócio) — só falta uma forma de identificá-lo e destacá-lo na lista, não criar um conceito novo                                                                 | y                                                                                                                                                  |
| `Service.cost_price` (campo novo no backend)                                                | Adiciona campo nullable, mesmo padrão do `Product.cost_price` (opcional, "custo não informado ainda")                                                                                                                                                                                                                                    | Service hoje só tem `unit_price` (preço de venda) — pedido explícito foi "valor de custo / valor de venda para ambos" (produto E serviço)                                                                                               | y                                                                                                                                                  |

**Open questions:** uma pendência registrada acima (o card de Orçamento/OS no Veículo) — todo o resto foi resolvido ou assumido com justificativa.

---

## User Stories

### P1: Fluxo de salvar fica no registro, não na listagem ⭐ MVP

**User Story**: Como atendente, quero que salvar um cliente/veículo/fornecedor me deixe no próprio registro (ou volte pra onde eu estava), pra conseguir completar o cadastro (adicionar veículo, etc.) sem precisar navegar de novo.

**Why P1**: É o atrito mais citado no pedido original e o mais barato de corrigir — só muda `redirectTo`, sem componente novo.

**Acceptance Criteria**:

1. WHEN o usuário cria um Cliente novo THEN o sistema SHALL redirecionar pra tela de edição do cliente recém-criado (não para `/clientes`).
2. WHEN o usuário salva a edição de um Cliente existente THEN o sistema SHALL permanecer na tela de edição (não redirecionar pra `/clientes`).
3. WHEN o usuário cria um Veículo a partir do botão "Adicionar veículo" da edição de um Cliente THEN o sistema SHALL voltar pra edição desse Cliente ao salvar (não para `/veiculos`).
4. WHEN o usuário cria um Veículo por qualquer outro caminho (não a partir de um Cliente) THEN o sistema SHALL redirecionar pra edição do veículo recém-criado (não para `/veiculos`).
5. WHEN o usuário cria um Fornecedor novo THEN o sistema SHALL redirecionar pra edição do fornecedor recém-criado (não para `/fornecedores`).
6. WHEN a tela de edição de Cliente não tem nenhum veículo vinculado THEN o sistema SHALL ocultar o card de veículos em vez de mostrar com mensagem vazia.
7. WHEN o botão "Adicionar veículo" é exibido na edição do Cliente THEN o sistema SHALL mostrar o rótulo "Adicionar veículo" (hoje só ícone).
8. WHEN os botões de adicionar produto/serviço são exibidos na edição de Fornecedor THEN o sistema SHALL mostrar os rótulos "Adicionar produto"/"Adicionar serviço" (hoje só ícone).
9. WHEN o menu lateral mostra o grupo Veículos THEN o sistema SHALL ordenar os itens como Marca → Modelo → Veículo (hoje é Veículo → Marca → Modelo).
10. WHEN o campo Placa é editado THEN o sistema SHALL aplicar máscara automática conforme o formato detectado (antigo AAA-0000 ou Mercosul AAA0A00).
11. WHEN o nome, sobrenome, endereço ou bairro são digitados na edição de Cliente THEN o sistema SHALL capitalizar a primeira letra automaticamente.
12. WHEN um campo obrigatório é exibido em qualquer um desses formulários THEN o sistema SHALL marcar com `*` visível.

**Independent Test**: Criar um cliente novo, confirmar que cai na edição dele (não na lista), clicar "Adicionar veículo", salvar o veículo, e confirmar que volta pra edição do cliente (não pra lista de veículos nem de clientes).

---

### P2: Cards e campos relacionados viram navegáveis e usam select com busca

**User Story**: Como atendente, quero clicar num veículo/produto/serviço listado dentro da tela de Cliente/Fornecedor e ir direto pra edição dele, e usar o select com busca também nos campos de Fornecedor/Marca/Modelo.

**Why P2**: Depende da feature `live-select` já estar com o primitivo `LiveSelect` pronto (reaproveitado aqui pra Fornecedor/Marca/Modelo) — não é bloqueante do P1, mas depende de outra feature.

**Acceptance Criteria**:

1. WHEN o usuário clica num veículo dentro do modal de veículos do Cliente (listagem) THEN o sistema SHALL navegar pra edição desse veículo.
2. WHEN o usuário clica num produto ou serviço listado na edição de Fornecedor THEN o sistema SHALL navegar pra edição desse produto/serviço (hoje não faz nada).
3. WHEN a lista de produtos de um Fornecedor é exibida THEN o sistema SHALL mostrar a quantidade em estoque de cada produto, abaixo do preço.
4. WHEN o campo Fornecedor é exibido na edição de Produto THEN o sistema SHALL usar um select com busca (`SupplierLiveSelect`, construído sobre o `LiveSelect` da feature `live-select`) em vez do `<select>` fechado atual.
5. WHEN o campo Cliente é exibido na criação/edição de Veículo THEN o sistema SHALL usar `ClientLiveSelect` (já existente da feature `live-select`) em vez do botão "+"/ícone de olho atuais.
6. WHEN os campos Marca e Modelo são exibidos na criação/edição de Veículo THEN o sistema SHALL usar selects com busca (`ManufacturerLiveSelect`/`ModelLiveSelect`, novos, seguindo o mesmo padrão do `LiveSelect`).
7. WHEN o campo Unidade de Medida é exibido na edição de Produto THEN o sistema SHALL usar o mesmo estilo de texto livre + sugestões (datalist) que o campo Cor de Veículo já usa, permitindo digitar um valor novo.
8. WHEN a edição de Produto é exibida THEN o sistema SHALL posicionar o painel de histórico de estoque ao lado do formulário (mesmo layout em grade de duas colunas já usado em Cliente/Fornecedor/Veículo), não empilhado abaixo.

**Independent Test**: Num Fornecedor com produtos cadastrados, clicar num produto da lista e confirmar que abre a edição dele; na edição de um Produto, confirmar que o campo Fornecedor já é busca com texto, não lista fechada.

---

### P3: WhatsApp de pedido de compra, modal de saída financeira, fornecedor-próprio em primeiro, e custo de serviço

**User Story**: Como dono de oficina, quero pedir reposição de produto direto pelo WhatsApp do fornecedor, decidir na hora se o cadastro de um produto novo já vira uma saída financeira, ver meu próprio estabelecimento primeiro na lista de fornecedores, e registrar o custo de um serviço (não só o preço de venda).

**Why P3**: Reúne os itens que ou introduzem um padrão de interação novo (modal pós-save) ou tocam o backend (campo novo em `Service`) — mais risco/esforço que P1/P2, mas nenhum bloqueia os outros.

**Acceptance Criteria**:

1. WHEN a edição de Fornecedor é exibida E o fornecedor tem telefone cadastrado THEN o sistema SHALL mostrar um botão de WhatsApp (mesmo padrão já usado em Cliente/Agendamento/OS).
2. WHEN a listagem de Produtos é exibida THEN o sistema SHALL mostrar um ícone por linha que abre o WhatsApp do fornecedor daquele produto com uma mensagem pré-preenchida de pedido de compra.
3. WHEN a edição de Produto é exibida THEN o sistema SHALL mostrar o mesmo botão de WhatsApp de pedido de compra dentro do formulário.
4. WHEN `stock_quantity` de um produto é menor ou igual a zero na listagem THEN o sistema SHALL aplicar um destaque visual mais forte que o aviso de "abaixo do mínimo" já existente.
5. WHEN um Produto novo é salvo com sucesso THEN o sistema SHALL abrir um modal perguntando se o usuário quer registrar uma saída financeira correspondente (valor sugerido: custo × quantidade), usando a API de `FinancialEntry` já existente.
6. WHEN a lista de opções de Fornecedor é exibida em qualquer select (Produto, Serviço) THEN o sistema SHALL mostrar o fornecedor-espelho do próprio estabelecimento como primeira opção.
7. WHEN o formulário de Serviço é exibido THEN o sistema SHALL ter um campo de preço de custo (novo, opcional), além do preço de venda já existente.

**Independent Test**: Cadastrar um produto novo com custo e quantidade informados, confirmar que o modal de saída financeira aparece e, ao confirmar, que uma `FinancialEntry` é criada com o valor sugerido.

---

## Edge Cases

- WHEN um Fornecedor não tem telefone cadastrado THEN o sistema SHALL ocultar o botão de WhatsApp (mesmo comportamento que `WhatsAppButton` já tem hoje pros outros usos).
- WHEN o Produto não tem Fornecedor com telefone (campo obrigatório, mas ainda assim pode estar vazio de telefone) THEN o sistema SHALL ocultar o ícone de pedido de compra na listagem, mesma regra acima.
- WHEN a placa digitada não bate com nenhum dos dois formatos (nem no meio da digitação) THEN o sistema SHALL deixar a validação final (zod, já existente) barrar o submit, sem travar a digitação no meio do caminho.
- WHEN o usuário fecha o modal de "registrar saída financeira" sem escolher (ex. clica fora) THEN o sistema SHALL tratar como "não", sem criar a `FinancialEntry` nem bloquear a navegação.

---

## Requirement Traceability

| Requirement ID  | Story | Phase  | Status  |
| --------------- | ----- | ------ | ------- |
| CVSP-P1-01 a 12 | P1    | Design | Pending |
| CVSP-P2-01 a 08 | P2    | Design | Pending |
| CVSP-P3-01 a 07 | P3    | Design | Pending |

**Coverage:** 27 total, 0 mapped a tasks, 27 unmapped ⚠️ (normal nesta fase)

---

## Success Criteria

- [ ] Nenhum fluxo de criar/editar Cliente/Veículo/Fornecedor redireciona mais pra listagem.
- [ ] Cards de relacionados (veículos, produtos, serviços) são clicáveis em 100% dos casos listados.
- [ ] Fornecedor e Produto têm atalho de WhatsApp funcional.
- [ ] `Service.cost_price` existe e aparece no formulário.
