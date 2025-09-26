# AI-Powered Todo App

Uma aplicação moderna de lista de tarefas inteligente que utiliza **Inteligência Artificial** para gerar automaticamente subtarefas a partir de objetivos de alto nível descritos pelo usuário.

## 🎯 O que esta aplicação faz?

Imagine que você precisa **"planejar uma viagem para o Japão"**. Em vez de pensar em todas as tarefas necessárias, você simplesmente descreve seu objetivo e a **IA gera automaticamente** uma lista completa de subtarefas acionáveis como:

- Pesquisar voos
- Reservar hotel  
- Obter visto
- Planejar roteiro
- Trocar moeda
- E muito mais...

### 🎬 Preview da Aplicação

<div align="center">

[![Preview da Aplicação](https://img.youtube.com/vi/4KOydEUjCdo/maxresdefault.jpg)](https://www.youtube.com/watch?v=4KOydEUjCdo)

*Clique na imagem para assistir ao preview da aplicação em ação! Interface moderna, geração inteligente de tarefas e experiência de usuário otimizada.*

</div>

## 🚀 Tecnologias Utilizadas

### Backend (Servidor)
- **NestJS** - Framework moderno para criar APIs robustas e escaláveis
- **TypeScript** - Linguagem que torna o código mais seguro e fácil de manter
- **Prisma** - Ferramenta que facilita o trabalho com banco de dados
- **SQLite** - Banco de dados simples e portável
- **LangChain** - Biblioteca especializada para integração com Inteligência Artificial
- **Swagger** - Documentação automática da API

### Frontend (Interface do Usuário)
- **Next.js 14** - Framework React moderno para criar interfaces rápidas
- **TypeScript** - Tipagem estática para código mais seguro
- **Tailwind CSS** - Sistema de design responsivo e moderno
- **Redux Toolkit** - Gerenciamento de estado da aplicação
- **Atomic Design** - Arquitetura de componentes reutilizáveis

### Inteligência Artificial
- **LangGraph** - Framework para criar agentes inteligentes
- **LangChain** - Biblioteca para integração com modelos de IA
- **Python** - Linguagem principal para desenvolvimento de IA
- **Hugging Face** - Plataforma de modelos de IA gratuitos
- **OpenRouter** - Acesso a múltiplos provedores de IA (GPT, Claude, etc.)

## 📁 Estrutura do Projeto

```
/ai-powered-todo-app
├── apps/
│   ├── backend/         # API NestJS (servidor)
│   ├── frontend/        # Interface Next.js (cliente)
│   └── ia/              # Estudo de IA Agentic
├── docs/
│   ├── desafio.md       # Especificações do desafio
│   └── solucao.md       # Arquitetura da solução
├── package.json         # Configuração do projeto
└── README.md           # Este arquivo
```

### 📚 Documentação Técnica

- **[Backend README](./apps/backend/README.md)** - Documentação completa da API NestJS
- **[API Documentation](./apps/backend/API.md)** - Especificação detalhada dos endpoints REST
- **[Frontend README](./apps/frontend/README.md)** - Documentação da interface Next.js com Atomic Design
- **[Frontend Setup](./apps/frontend/SETUP.md)** - Guia de configuração e resolução de problemas
- **[Frontend Highlights](./docs/frontend-highlights.md)** - Destaques técnicos da implementação
- **[🤖 Estudo de IA Agentic](./apps/ia/README.md)** - Estudo profundo sobre criação de agentes inteligentes com LangGraph

## 🛠️ Como executar a aplicação

### Pré-requisitos
- **Node.js** >= 18.0.0 (ambiente de execução JavaScript)
- **pnpm** >= 8.0.0 (gerenciador de pacotes)

### Instalação rápida

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd ai-powered-todo-app
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Execute a aplicação completa:**
```bash
pnpm dev
```

### Acessando a aplicação

Após executar `pnpm dev`, acesse:

- **Interface do usuário**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:3001](http://localhost:3001)
- **Documentação da API**: [http://localhost:3001/api](http://localhost:3001/api)

### Scripts disponíveis

```bash
# Desenvolvimento
pnpm dev          # Executa frontend + backend
pnpm dev-api      # Apenas backend
pnpm dev-app      # Apenas frontend

# Produção
pnpm build        # Build completo
pnpm start        # Executa em produção
```

## ✨ Funcionalidades Principais

### Para o Usuário Final
- 🎯 **Criação inteligente de listas** - Descreva um objetivo e receba tarefas automáticas
- 📝 **Gerenciamento manual** - Crie, edite e organize tarefas manualmente
- ✅ **Controle de progresso** - Marque tarefas como concluídas
- 🔄 **Atualizações em tempo real** - Interface sempre sincronizada
- 🔑 **Integração com IA** - Use sua própria API Key (Hugging Face/OpenRouter)
- 📱 **Design responsivo** - Funciona perfeitamente em desktop e mobile

### Para Desenvolvedores
- 🚀 **API REST completa** - Endpoints bem documentados e testáveis
- 📚 **Documentação interativa** - Swagger UI + OpenAPI JSON
- 🔒 **Autenticação segura** - Bearer Token para controle de acesso
- 🗄️ **Banco de dados robusto** - SQLite com Prisma ORM
- 🤖 **Integração IA avançada** - LangChain para múltiplos provedores
- 🏗️ **Arquitetura escalável** - Atomic Design para componentes reutilizáveis
- ⚡ **Performance otimizada** - Next.js 14 com App Router e build otimizado

## 🤖 Como funciona a IA?

### Processo atual (funcional):

1. **Configure sua API Key** ✅ - Use sua própria chave do Hugging Face ou OpenRouter
2. **Descreva seu objetivo** ✅ - Ex: "planejar uma viagem para o Japão"
3. **Preview das tarefas** ✅ - Veja as tarefas antes de criar (funcional)
4. **Receba tarefas automáticas** ✅ - A IA gera uma lista completa de subtarefas (testado e validado)

### Provedores de IA suportados:
- **Hugging Face** ✅ - Opção gratuita para testes (configurado)
- **OpenRouter** ✅ - Acesso a múltiplos modelos LLM (GPT, Claude, etc.) (configurado)

### Status da Integração IA:
- ~~**Configuração**: Sistema de configuração de API Keys implementado~~ ✅ **Concluído**
- ~~**Interface**: Formulário de entrada para prompts da IA~~ ✅ **Concluído**
- ~~**Preview**: Componente para mostrar preview das tasks geradas~~ ✅ **Concluído**
- ~~**LangChain**: Integração real com provedores (testado e validado)~~ ✅ **Concluído**
- ~~**JSON Parsing**: Parser para resposta da IA (implementado)~~ ✅ **Concluído**
- ~~**Criação**: Endpoint para criar tasks a partir do preview (funcional)~~ ✅ **Concluído**

## 🏗️ Arquitetura do Frontend (Atomic Design)

### Metodologia Atomic Design
O frontend foi desenvolvido seguindo os princípios do **Atomic Design** de Brad Frost, criando uma arquitetura de componentes escalável e reutilizável:

```
📦 Componentes
├── 🔬 Atoms (Elementos básicos)
│   ├── Button, Input, Checkbox, Card, LoadingSpinner
│   └── Componentes indivisíveis e reutilizáveis
├── 🧬 Molecules (Combinações simples)
│   ├── TaskItem, TaskForm, AIForm, TaskListHeader
│   └── Combinações de atoms com funcionalidade específica
├── 🦠 Organisms (Componentes complexos)
│   ├── TaskList, TaskListSelector, AISettings
│   └── Seções funcionais completas da interface
├── 📄 Templates (Layouts de página)
│   ├── MainLayout, TaskListTemplate
│   └── Estruturas de página sem conteúdo específico
└── 📱 Pages (Páginas completas)
    └── Implementações específicas dos templates
```

### Benefícios da Arquitetura:
- **🔄 Reutilização**: Componentes atômicos podem ser reutilizados em qualquer lugar
- **🧪 Testabilidade**: Cada componente pode ser testado isoladamente
- **📈 Escalabilidade**: Fácil adição de novas funcionalidades
- **🎨 Consistência**: Design system unificado em toda a aplicação
- **⚡ Performance**: Componentes otimizados e lazy loading

## 📊 Como os dados são organizados

### Estrutura simples e intuitiva:
```
Usuário
  └── Lista de Tarefas (ex: "Viagem para o Japão")
      ├── Tarefa 1: "Pesquisar voos"
      ├── Tarefa 2: "Reservar hotel"
      └── Tarefa 3: "Obter visto"
```

### Informações armazenadas:
- **Usuário**: Nome, configurações de IA, API Keys
- **Lista**: Nome, descrição, prompt original da IA, contadores
- **Tarefa**: Título, status de conclusão, posição na lista



## 🛠️ Tecnologias e Padrões Utilizados

### Backend (NestJS)
- **Arquitetura**: Domain-Driven Design (DDD) com módulos bem definidos
- **ORM**: Prisma com SQLite para desenvolvimento e portabilidade
- **Validação**: Class-validator e class-transformer para DTOs
- **Documentação**: Swagger/OpenAPI para documentação automática
- **IA**: LangChain para integração com múltiplos provedores LLM

### Frontend (Next.js + Atomic Design)
- **Framework**: Next.js 14 com App Router para performance otimizada
- **Arquitetura**: Atomic Design para componentes escaláveis e reutilizáveis
- **Styling**: Tailwind CSS com design system customizado
- **State Management**: Custom hooks para gerenciamento de estado
- **TypeScript**: Tipagem estática completa para maior segurança
- **API Client**: Axios com interceptors para tratamento de erros

### Padrões de Desenvolvimento
- **Monorepo**: Workspace com pnpm para gerenciamento de dependências
- **TypeScript**: Tipagem estática em toda a aplicação
- **ESLint**: Linting consistente para qualidade de código
- **Componentização**: Arquitetura baseada em componentes reutilizáveis
- **Responsive Design**: Interface adaptável para todos os dispositivos


## 🤖 Resumo do Estudo de IA Agentic

### 🎯 Goal (Objetivo)
Implementar da "maneira criativa" um agente para executar "tarefas" para um "smart to-do list" usando Python e tecnologias de mercado estabelecidas.

### 📋 Strategy (Estratégia)
O estudo apresenta uma estratégia completa baseada em **7 pilares fundamentais** para construir agentes LangGraph robustos:

1. **Persistence** 💾 - Manutenção de estado entre execuções
2. **Durable Execution** 🔄 - Resistência a falhas e recuperação automática
3. **Streaming** 📡 - Feedback em tempo real durante processamento
4. **Human-in-the-Loop** 👤 - Intervenção humana quando necessário
5. **Time Travel** ⏰ - Navegação e recuperação de estados anteriores
6. **Memory** 🧠 - Gerenciamento de contexto e aprendizado contínuo
7. **Subgraphs** 📦 - Modularização em componentes reutilizáveis

### 🤔 Os Porquês (PQs)

**Por que Python?**
- IA é fluida, flexível e livre - Python oferece essa flexibilidade
- Ecossistema inigualável para IA e Machine Learning
- Acesso direto aos melhores frameworks (LangChain, LangGraph)
- Comunidade focada em pesquisa e desenvolvimento de IA
- Performance superior para tarefas intensivas em CPU

**Por que tecnologias de mercado estabelecidas?**
- Facilita resolução de problemas com soluções da comunidade open source
- Não é cedo demais, mas também não é tardio - timing ideal
- Suporte robusto e documentação madura
- Facilita contratação de talentos especializados

**Por que LangGraph?**
- Framework de orquestração de baixo nível para agentes com estado
- Usado por empresas como Klarna, Replit, Elastic
- Focado inteiramente na orquestração de agentes
- Permite criar sistemas complexos e de longa duração

**Por que essa abordagem estratégica?**
- **Simplicidade e Praticidade**: Demonstra como criar agentes reativos baseados em princípios sólidos
- **Escalabilidade**: Cada pilar resolve problemas específicos de sistemas de IA em produção
- **Robustez**: Combinação de persistência, execução durável e recuperação de falhas
- **Experiência do Usuário**: Streaming e human-in-the-loop para interações naturais
- **Manutenibilidade**: Subgrafos e time travel para debugging e evolução

### 🚀 Implementação Prática
O estudo inclui um **Task Generator Agent** completo que demonstra todos os conceitos através de:
- Validação de intenção com score de viabilidade
- Processamento de passos estruturados
- Conversão para JSON padronizado
- Integração com LangSmith para observabilidade
- Exemplo prático de planejamento de viagem ao Japão

## 📄 Documentação Técnica

- **[Desafio](./docs/desafio.md)** - Especificações completas do teste técnico
- **[Solução](./docs/solucao.md)** - Arquitetura e abordagem da solução
- **[Backend API](./apps/backend/API.md)** - Documentação completa da API
- **[Backend README](./apps/backend/README.md)** - Guia técnico do backend
- **[Frontend README](./apps/frontend/README.md)** - Documentação da interface Next.js
- **[Frontend Highlights](./docs/frontend-highlights.md)** - Destaques técnicos da implementação
- **[🤖 Estudo de IA Agentic](./apps/ia/README.md)** - Estudo profundo sobre criação de agentes inteligentes com LangGraph