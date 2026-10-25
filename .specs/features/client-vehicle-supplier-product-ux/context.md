# Cliente/Veículo/Fornecedor/Produto UX Context

**Gathered:** 2026-10-20
**Spec:** `.specs/features/client-vehicle-supplier-product-ux/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Ajustes de fluxo (redirecionar pro registro em vez da listagem, labels, capitalização, máscara de placa, ordem de menu) + navegação real nos cards de relacionados + reaproveitamento do `LiveSelect` (feature `live-select`) nos campos de Fornecedor/Marca/Modelo + atalhos de WhatsApp em Fornecedor/Produto + destaque de estoque negativo + modal de saída financeira ao cadastrar produto + fornecedor-espelho priorizado + campo de custo em Serviço.

---

## Implementation Decisions

Esta feature não passou por uma rodada de Discuss interativa (o usuário sinalizou confiança e pediu ritmo — "eu tô confiando em ti"). As decisões abaixo vieram de pesquisa de embasamento no código + bom senso, todas registradas como Assumptions no spec, não como respostas diretas do usuário.

### Redirecionamentos pós-save

- Create Cliente/Veículo/Fornecedor → vai pra edição do próprio registro criado.
- Edit Cliente → fica na própria edição.
- Veículo criado a partir da edição de Cliente → volta pra edição do Cliente (não pra lista de veículos).

### Reaproveitamento do `live-select`

- `ClientLiveSelect` (já existente) é reaproveitado no campo Cliente de Veículo (Create+Edit), no lugar do botão "+"/ícone de olho atuais.
- `ManufacturerLiveSelect`/`ModelLiveSelect` (novos, mesma arquitetura do `LiveSelect`) entram nos campos Marca/Modelo de Veículo.
- `SupplierLiveSelect` (novo, mesma arquitetura) entra no campo Fornecedor de Produto.

### Modal de saída financeira ao cadastrar Produto

- Pergunta Sim/Não logo após salvar, valor sugerido = custo × quantidade — sem endpoint novo, reusa `FinancialEntry` já existente.

## Agent's Discretion

- Mensagem padrão do link de WhatsApp de pedido de compra (texto exato é editável pelo usuário no próprio WhatsApp antes de enviar).
- Estilo exato do destaque de estoque negativo/zero (vermelho mais forte que o aviso de "abaixo do mínimo", não especificado em pixel).

## Declined / Undiscussed Gray Areas → Assumptions

- Máscara de placa cobrindo os dois formatos — decisão técnica registrada no spec, não uma pergunta de UX.
- Card "Abrir Orçamento"/"Abrir OS" na edição de Veículo — pesquisa de embasamento não cobriu esse item especificamente (a tela de Veículo não tem hoje nem um placeholder como a de Cliente tem pra orçamento). Fica registrado no spec como P3 com confirmação pendente antes do Design detalhar esse componente especificamente.
- Identificação do fornecedor-espelho nos selects — assume que dá pra achar pelo CNPJ batendo com o do `Business`; Design deve confirmar isso lendo `business_service.py` com mais atenção antes de implementar (não foi verificado se há um jeito mais direto, tipo uma flag no model).

---

## Specific References

Nenhuma — mesma situação do `live-select`: o usuário mencionou exemplos mandados por WhatsApp em outras partes do textão original, não especificamente para este bloco.

---

## Deferred Ideas

- Tudo do bloco 3 (Orçamento/OS/Financeiro) e bloco 4 (RBAC/Agendamento/Dashboard) — viram specs próprias, nesta mesma leva.
- Busca no servidor pros novos selects com busca, caso o volume de fornecedores/marcas/modelos cresça muito no futuro.
