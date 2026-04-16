<br />
<div align="center">
  <h1 align="center">🏭 Factory Project</h1>
  <p align="center">
    <strong>Plataforma SaaS Multi-Tenant para Gestão de Empreendimentos (Frontend)</strong>
    <br />
    <br />
    Um sistema robusto e modular, focado em alta performance e interface _premium_ para gestão de clientes, fornecedores, agendamentos e serviços.
  </p>
</div>

<hr />

## 🚀 Sobre o Projeto (Em Desenvolvimento)

O **Factory Project** é uma solução completa para gestão de operações comerciais. O sistema opera sob um modelo de negócio **SaaS (Software as a Service)**, onde _SuperUsers_ gerenciam as licenças e renovações de acesso, e _Usuários Comuns_ administram os dados operacionais isoladamente por **Empreendimento** (Tenant).

Este repositório contém o **Frontend** da aplicação, estruturado com foco em design sistêmico, UI/UX refinada (glassmorphism flexível) e rotas modulares. O backend responsável é uma API construída em **Django/DRF**.

---

## 💻 Tecnologias Empregadas

O ambiente Frontend foi idealizado para ser limpo moderno:

- ⚡ **[React + Vite](https://vitejs.dev/)**: Motor principal da aplicação para Fast Refresh ultra-rápido.
- 🎨 **[Tailwind CSS](https://tailwindcss.com/)**: Estilização baseada em utilitários visando criar componentes visuais "Premium".
- 🗺️ **[React Router DOM](https://reactrouter.com/)**: Estrutura modular de roteamento _(App -> Layout -> PrivateRoute)_.
- 🔗 **[Axios](https://axios-http.com/)**: Comunicação limpa e baseada em interceptors com a API REST Django.
- 🖼️ **[Lucide React](https://lucide.dev/)**: Ícones leves, dinâmicos e de altíssima qualidade.

---

## 🧩 Estrutura de Módulos (Características)

O sistema foi componentizado em módulos de negócio _Stand-Alone_, garantindo controle de dependência e facilidade de manutenção.

*   🏢 **Business (Empreendimentos)**: Cadastro multilocatário, logotipos customizados e configurações locais de empresa.
*   🔑 **License (Licenças/Faturamento)**: Acompanhamento de **status rigoroso gerido pelo backend** (`TRIAL`, `ACTIVE`, `EXPIRED`). Visualização de DIAS RESTANTES e controle automático de teto máximo de usuários por sistema.
*   📦 **Suppliers & Products (Catálogos)**: Entidades interligadas para gestão da base de distribuição.
*   📅 **Appointments (Agendamentos)**: Sistema relacional sofisticado, cruzando Clientes, Veículos e Serviços.
*   📍 **Location (Cidades e Estados)**: Rotas auxiliares para construção escalável de endereços BR.

---

## ⚙️ Instalação e Execução (Ambiente Local)

Siga os passos abaixo para configurar e rodar o Factory Frontend na sua máquina:

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/factory_project_frontend.git
   cd factory_project_frontend
   ```

2. **Instale as dependências**
   Recomendamos a utilização do `npm` ou `yarn`:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Certifique-se do Backend**
   Para funcionamento pleno (_Login, Fetchs e Autenticação_), seu backend Django precisar estar operando em modo local, preferencialmente apontando para as CORS origins deste repositório (via de regra: `http://localhost:5173`).

---

## 🐳 Execução via Docker

A forma mais rápida e recomendada de rodar o ambiente é através do Docker, garantindo que todas as dependências estejam isoladas.

1. **Suba o container do Frontend**
   ```bash
   docker compose up --build -d
   ```

2. **Acesse a aplicação**
   Acesse [http://localhost:5173](http://localhost:5173) no seu navegador.

---

## 🖌️ Design System e Padronização de Componentes

O sistema opera embasado em **Custom Hooks** `(ex: useLicenseForm, useSupplierForm)` e Componentes Core Reutilizáveis localizados na pasta `src/modules/core/components/`, tais como:
- `ListHeader` e `ListTable`: Cabeçallho de filtragem com Tabelas responsivas assíncronas padrão.
- `FormField` e `SelectField`: Elementos de transição suave com `focus-within:text-indigo-600`
- `PrimaryButton`: UX unificada para chamadas de ação primárias.

<br />

> _"Construído ativamente focando não apenas num MVP, mas num produto palpável de ponta-a-ponta."_
