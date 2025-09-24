# AI-Powered Todo App

Uma aplicação moderna de lista de tarefas inteligente que utiliza Inteligência Artificial para gerar automaticamente subtarefas a partir de objetivos de alto nível descritos pelo usuário.

## 🚀 Tecnologias

### Backend
- **NestJS** com TypeScript
- **SQLite** para persistência de dados
- Integração com APIs de IA (Hugging Face/OpenRouter)

### Frontend
- **Next.js** com TypeScript
- Interface reativa e intuitiva
- Gerenciamento de estado em tempo real

## 📁 Estrutura do Projeto

```
/smart-todo-list
├── apps/
│   ├── backend/         # Aplicação NestJS
│   └── frontend/        # Aplicação Next.js
├── docs/
│   ├── desafio.md       # Especificações do desafio
│   └── solucao.md       # Arquitetura da solução
├── package.json         # Gerenciador do monorepo
└── README.md
```

## 🛠️ Pré-requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd ai-powered-todo-app
```

2. Instale as dependências:
```bash
pnpm install
```

## 🚀 Como executar

### Desenvolvimento
Para executar ambas as aplicações em modo de desenvolvimento:
```bash
pnpm dev
```

### Executar aplicações individualmente
```bash
# Backend apenas
pnpm dev-api

# Frontend apenas
pnpm dev-app
```

### Build para produção
```bash
# Build de ambas as aplicações
pnpm build

# Build individual
pnpm build-api    # Backend apenas
pnpm build-app    # Frontend apenas
```

## 🎯 Funcionalidades

### Backend (NestJS)
- ✅ **CRUD completo de listas de tarefas e tasks**
- ✅ **API simplificada** - Um endpoint principal (`GET /task-lists`) retorna tudo
- ✅ **Integração com APIs de IA** (Hugging Face/OpenRouter)
- ✅ **Persistência com SQLite** + Prisma ORM
- ✅ **Geração automática de listas completas** com IA
- ✅ **Autenticação por Bearer Token**
- ✅ **Documentação interativa** com Swagger UI

### Frontend (Next.js)
- ✅ Interface para gerenciar listas de tarefas
- ✅ Formulário para criação manual de tasks
- ✅ Funcionalidade de IA com campo de API Key
- ✅ Atualização em tempo real das listas

## 🤖 Integração com IA

A aplicação permite que o usuário:
1. Insira sua API Key do provedor de IA (Hugging Face/OpenRouter)
2. Descreva um objetivo de alto nível (ex: "planejar uma viagem")
3. Receba automaticamente uma lista de subtarefas acionáveis

## 📋 Modelo de Dados

### Estrutura Hierárquica
- **Users** → **Task Lists** → **Tasks**

### Usuário (`User`)
- `id`: ID único
- `name`: Nome (opcional)
- `isAnonymous`: Se é usuário anônimo
- `aiIntegrationType`: Tipo de IA (huggingface/openrouter)
- `aiToken`: Token da API de IA

### Lista de Tarefas (`TaskList`)
- `id`: ID único
- `userId`: ID do usuário proprietário
- `name`: Nome da lista
- `description`: Descrição opcional
- `iaPrompt`: Prompt original da IA
- `tasksCount`: Número total de tasks
- `completedTasksCount`: Número de tasks concluídas

### Tarefa (`Task`)
- `id`: ID único
- `listId`: ID da lista de tarefas
- `title`: Título da tarefa
- `isCompleted`: Status de conclusão
- `position`: Posição na lista (ordenação)

## 🧪 Scripts Disponíveis

### Scripts Combinados
- `pnpm dev` - Executa ambas as aplicações em desenvolvimento
- `pnpm build` - Build das aplicações para produção
- `pnpm start` - Executa as aplicações em produção
- `pnpm lint` - Executa linting em ambas as aplicações
- `pnpm clean` - Limpa arquivos de build

### Scripts Individuais
- `pnpm dev-api` - Executa apenas o backend em desenvolvimento
- `pnpm dev-app` - Executa apenas o frontend em desenvolvimento
- `pnpm build-api` - Build apenas do backend
- `pnpm build-app` - Build apenas do frontend
- `pnpm start-api` - Executa apenas o backend em produção
- `pnpm start-app` - Executa apenas o frontend em produção
- `pnpm lint-api` - Linting apenas do backend
- `pnpm lint-app` - Linting apenas do frontend
- `pnpm clean-api` - Limpa arquivos de build do backend
- `pnpm clean-app` - Limpa arquivos de build do frontend

## 📝 Próximos Passos

1. Configurar o backend NestJS
2. Implementar a API de tarefas
3. Integrar com provedores de IA
4. Desenvolver a interface Next.js
5. Conectar frontend com backend

## 📄 Documentação

- [Desafio](./docs/desafio.md) - Especificações completas do teste técnico
- [Solução](./docs/solucao.md) - Arquitetura e abordagem da solução
