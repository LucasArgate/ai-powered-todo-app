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

[![Preview da Aplicação](https://img.shields.io/badge/🎬-Assistir%20Preview-blue?style=for-the-badge)](./docs/material/preview-app-banner.mp4)

*Clique no botão acima para assistir ao preview da aplicação em ação! Interface moderna, geração inteligente de tarefas e experiência de usuário otimizada.*

## 🚀 Tecnologias Utilizadas

### Por que essas tecnologias?

**Backend (NestJS + TypeScript)**
- ✅ **NestJS**: Framework robusto e escalável para APIs empresariais
- ✅ **TypeScript**: Código mais seguro e manutenível
- ✅ **Prisma**: ORM moderno que facilita desenvolvimento e manutenção do banco
- ✅ **SQLite**: Banco simples e portável (conforme especificado no desafio)
- ✅ **LangChain**: Biblioteca especializada para integração com LLMs (IA)
- ✅ **Swagger + OpenAPI**: Documentação técnica e compatibilidade com MCP servers

**Frontend (Next.js + TypeScript + Atomic Design)**
- ✅ **Next.js 14**: Framework React moderno com App Router para performance otimizada
- ✅ **TypeScript**: Tipagem estática completa para código mais seguro e manutenível
- ✅ **Atomic Design**: Arquitetura de componentes escalável e reutilizável
- ✅ **Tailwind CSS**: Sistema de design consistente e responsivo
- ✅ **Interface Reativa**: Atualizações em tempo real sem recarregar página
- ✅ **State Management**: Hook customizado para gerenciamento de estado centralizado

## 📁 Estrutura do Projeto

```
/ai-powered-todo-app
├── apps/
│   ├── backend/         # API NestJS (servidor)
│   └── frontend/        # Interface Next.js (cliente)
├── docs/
│   ├── desafio.md       # Especificações do desafio técnico
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

## 📝 Status do Projeto

### ✅ Concluído - Infraestrutura Base
- ~~Configurar o backend NestJS~~ ✅ **Concluído**
- ~~Implementar a API de tarefas~~ ✅ **Concluído**
- ~~Integrar com provedores de IA~~ ✅ **Concluído**
- ~~Documentação técnica completa~~ ✅ **Concluído**
- ~~Desenvolver a interface Next.js~~ ✅ **Concluído**
- ~~Conectar frontend com backend~~ ✅ **Concluído**
- ~~Implementar interface de usuário moderna~~ ✅ **Concluído**
- ~~Sistema de autenticação~~ ✅ **Concluído**
- ~~CRUD completo de listas e tarefas~~ ✅ **Concluído**
- ~~Interface responsiva com Atomic Design~~ ✅ **Concluído**

### ✅ Concluído - Funcionalidades Core
- ~~Gerenciamento de usuários~~ ✅ **Concluído**
- ~~Criação manual de listas e tarefas~~ ✅ **Concluído**
- ~~Edição e exclusão de tarefas~~ ✅ **Concluído**
- ~~Marcação de tarefas como concluídas~~ ✅ **Concluído**

### ✅ Concluído - Geração Inteligente de Tasks

#### 🤖 Sistema de IA - Preview e Geração
- **🔄 Preview de Tasks**: Sistema para mostrar preview das tasks antes de criar
  - ~~Interface de preview implementada~~ ✅ **Concluído**
  - ~~Componente AIForm com validação~~ ✅ **Concluído**
  - ~~Integração com configurações de IA~~ ✅ **Concluído**
  - ~~Chamada real para LangChain (testado e validado)~~ ✅ **Concluído**
  - ~~Parsing do JSON response (implementado)~~ ✅ **Concluído**
  - ~~Validação do formato de retorno (funcional)~~ ✅ **Concluído**

- **⚡ LangChain Integration**: Integração completa com provedores de IA
  - ~~Estrutura base do LangChain service~~ ✅ **Concluído**
  - ~~Configuração de múltiplos provedores (Hugging Face, OpenRouter)~~ ✅ **Concluído**
  - ~~Prompt engineering otimizado (testado)~~ ✅ **Concluído**
  - ~~JSON schema validation (implementado)~~ ✅ **Concluído**
  - ~~Error handling robusto (funcional)~~ ✅ **Concluído**
  - ~~Rate limiting e retry logic (configurado)~~ ✅ **Concluído**

- **📊 Task Generation Pipeline**: Pipeline completo de geração
  - ~~Frontend: Formulário de entrada com validação~~ ✅ **Concluído**
  - ~~Frontend: Preview component para mostrar tasks geradas~~ ✅ **Concluído**
  - ~~Backend: Endpoint para preview (funcional)~~ ✅ **Concluído**
  - ~~Backend: Endpoint para criação final (testado)~~ ✅ **Concluído**
  - ~~Validação de qualidade das tasks geradas (implementado)~~ ✅ **Concluído**

#### 🎯 Melhorias Futuras

1. **Performance e UX** 🚧
   - Otimizar prompts para gerar tasks mais acionáveis
   - Implementar templates específicos por categoria
   - Adicionar validação de qualidade das respostas da IA

2. **Funcionalidades Avançadas** 🚧
   - Sistema de notificações e lembretes
   - Compartilhamento de listas entre usuários
   - Integrações com outras ferramentas de produtividade

3. **Deploy e Produção** 🚧
   - Configurar ambiente de produção
   - Implementar monitoramento e analytics
   - Otimizações específicas para mobile

## 🎉 Status do MVP - CONCLUÍDO

### ✅ MVP Entregue com Sucesso
O **MVP (Minimum Viable Product)** da aplicação AI-Powered Todo App foi **concluído com sucesso** e está totalmente funcional:

- ~~**Backend completo** com NestJS, Prisma e SQLite~~ ✅ **Concluído**
- ~~**Frontend moderno** com Next.js 14 e Atomic Design~~ ✅ **Concluído**
- ~~**Integração IA funcional** com LangChain (testado e validado)~~ ✅ **Concluído**
- ~~**CRUD completo** de usuários, listas e tarefas~~ ✅ **Concluído**
- ~~**Geração automática** de tarefas via IA (Hugging Face + OpenRouter)~~ ✅ **Concluído**
- ~~**Interface responsiva** e experiência de usuário otimizada~~ ✅ **Concluído**
- ~~**Documentação técnica** completa e detalhada~~ ✅ **Concluído**

### 🚀 Funcionalidades Implementadas

#### **Core Features**
- **🎯 Geração Inteligente**: Sistema completo de geração de tarefas via IA
- **📝 Gerenciamento Manual**: CRUD completo para criação manual de tarefas
- **🔑 Configuração de IA**: Interface para configurar API Keys (Hugging Face/OpenRouter)
- **👤 Autenticação**: Sistema de usuários com sessão segura
- **📱 Design Responsivo**: Interface adaptável para desktop e mobile

#### **Arquitetura Técnica**
- **🏗️ Atomic Design**: Componentes escaláveis e reutilizáveis
- **⚡ Performance**: Next.js 14 com App Router otimizado
- **🔒 TypeScript**: Tipagem estática completa
- **📚 Documentação**: Swagger/OpenAPI para API REST
- **🗄️ Banco de Dados**: SQLite com Prisma ORM

### 📋 Roadmap Futuro
- **🚀 Deploy**: Configurar deploy em produção
- **📱 Mobile**: Otimizações específicas para mobile
- **🔔 Notificações**: Sistema de lembretes e notificações
- **📊 Analytics**: Dashboard de produtividade e métricas
- **🔄 Sync**: Sincronização offline e multi-dispositivo

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

## 📄 Documentação Técnica

- **[Desafio](./docs/desafio.md)** - Especificações completas do teste técnico
- **[Solução](./docs/solucao.md)** - Arquitetura e abordagem da solução
- **[Backend API](./apps/backend/API.md)** - Documentação completa da API
- **[Backend README](./apps/backend/README.md)** - Guia técnico do backend
- **[Frontend README](./apps/frontend/README.md)** - Documentação da interface Next.js
- **[Frontend Highlights](./docs/frontend-highlights.md)** - Destaques técnicos da implementação

## 🎯 Destaques Técnicos para Avaliação

### Arquitetura e Design Patterns
- **🏗️ Atomic Design**: Implementação completa da metodologia de Brad Frost
- **📦 Monorepo**: Estrutura organizada com workspace e dependências otimizadas
- **🔄 Componentização**: Sistema de componentes reutilizáveis e escaláveis
- **📱 Responsive Design**: Interface adaptável para todos os dispositivos

### Qualidade de Código
- **🔒 TypeScript**: Tipagem estática completa em frontend e backend
- **📏 ESLint**: Linting consistente e configurações otimizadas
- **📚 Documentação**: READMEs detalhados e documentação técnica completa
- **🎨 Design System**: Sistema de design consistente com Tailwind CSS

### Performance e Otimização
- **⚡ Next.js 14**: App Router para performance otimizada
- **📦 Build Otimizado**: Bundle otimizado para produção (28kB página principal)
- **🔄 State Management**: Gerenciamento de estado eficiente com custom hooks
- **📡 API Client**: Cliente HTTP otimizado com interceptors e tratamento de erros

### Integração e Funcionalidades
- **🤖 IA Integration**: Integração com múltiplos provedores (Hugging Face, OpenRouter)
- **🔄 Real-time**: Atualizações em tempo real sem recarregar página
- **🔐 Session Management**: Gerenciamento de sessão seguro com localStorage
- **📊 Data Management**: CRUD completo com validação e tratamento de erros