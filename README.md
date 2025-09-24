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

## 🚀 Tecnologias Utilizadas

### Por que essas tecnologias?

**Backend (NestJS + TypeScript)**
- ✅ **NestJS**: Framework robusto e escalável para APIs empresariais
- ✅ **TypeScript**: Código mais seguro e manutenível
- ✅ **Prisma**: ORM moderno que facilita desenvolvimento e manutenção do banco
- ✅ **SQLite**: Banco simples e portável (conforme especificado no desafio)
- ✅ **LangChain**: Biblioteca especializada para integração com LLMs (IA)
- ✅ **Swagger + OpenAPI**: Documentação técnica e compatibilidade com MCP servers

**Frontend (Next.js + TypeScript)**
- ✅ **Next.js**: Framework React para interfaces modernas e rápidas
- ✅ **TypeScript**: Consistência com o backend
- ✅ **Interface reativa**: Atualizações em tempo real sem recarregar página

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

- **[Backend README](./apps/backend/README.md)** - Documentação completa da API
- **[API Documentation](./apps/backend/API.md)** - Especificação detalhada dos endpoints
- **[Frontend README](./apps/frontend/README.md)** - Documentação da interface

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

### Para Desenvolvedores
- 🚀 **API REST completa** - Endpoints bem documentados e testáveis
- 📚 **Documentação interativa** - Swagger UI + OpenAPI JSON
- 🔒 **Autenticação segura** - Bearer Token para controle de acesso
- 🗄️ **Banco de dados robusto** - SQLite com Prisma ORM
- 🤖 **Integração IA avançada** - LangChain para múltiplos provedores

## 🤖 Como funciona a IA?

### Processo simples em 3 passos:

1. **Configure sua API Key** - Use sua própria chave do Hugging Face ou OpenRouter
2. **Descreva seu objetivo** - Ex: "planejar uma viagem para o Japão"
3. **Receba tarefas automáticas** - A IA gera uma lista completa de subtarefas

### Provedores de IA suportados:
- **Hugging Face** - Opção gratuita para testes
- **OpenRouter** - Acesso a múltiplos modelos LLM (GPT, Claude, etc.)

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

### ✅ Concluído
- ~~Configurar o backend NestJS~~ ✅ **Concluído**
- ~~Implementar a API de tarefas~~ ✅ **Concluído**
- ~~Integrar com provedores de IA~~ ✅ **Concluído**
- ~~Documentação técnica completa~~ ✅ **Concluído**

### 🚧 Em desenvolvimento
- Desenvolver a interface Next.js
- Conectar frontend com backend
- Testes de integração

### 📋 Próximos passos
- Implementar interface de usuário moderna
- Adicionar testes automatizados
- Deploy em ambiente de produção
- Otimizações de performance

## 📄 Documentação Técnica

- **[Desafio](./docs/desafio.md)** - Especificações completas do teste técnico
- **[Solução](./docs/solucao.md)** - Arquitetura e abordagem da solução
- **[Backend API](./apps/backend/API.md)** - Documentação completa da API
- **[Backend README](./apps/backend/README.md)** - Guia técnico do backend
