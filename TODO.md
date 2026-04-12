# 📝 Tarefas Futuras (Roadmap)

Aqui estão anotados alguns itens e pendências importantes para a evolução e polimento do **Factory Project**:

- [ ] **1. Filtro e Paginação no Backend**: Migrar a lógica de paginação e filtros pesados do Front-end (React) para o Back-end (Django/DRF) para otimizar desempenho e consumo de dados.
- [ ] **2. Limpeza de Licenças Órfãs**: Criar validações/rotinas (ou signals no Django) para auditar e limpar licenças atreladas a empreendimentos (`business_id`) que já foram excluídos ou não existem mais na plataforma.
- [ ] **3. Auditoria de Permissões (Testes de Tenant)**: Realizar testes extensivos de UI e requisições logando com usuários que **possuem** `business_id` definido (ou seja, usuários padrão que NÃO são SuperUsers). O objetivo é garantir o isolamento correto dos dados e verificar que as telas/botões sensíveis de SuperUser estão devidamente bloqueadas/ocultas.
