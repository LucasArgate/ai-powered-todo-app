# AI-Powered Todo App - Backend

Backend API para a aplicação de lista de tarefas com IA, construído com NestJS e TypeScript.

## 🚀 Funcionalidades

- **CRUD completo de listas de tarefas e tasks** com validação
- **Integração com IA** para geração automática de listas de tarefas
- **Banco SQLite** com Prisma ORM e migrações automáticas
- **API REST simplificada** com endpoints otimizados
- **Autenticação por Bearer Token** (user-id)
- **CORS configurado** para comunicação com frontend
- **Validação de dados** com class-validator
- **Documentação interativa** com Swagger UI

## 📋 Endpoints Disponíveis

### Listas de Tarefas (`/task-lists`)

- `GET /task-lists` - **Lista todas as listas do usuário com tasks incluídas**
- `POST /task-lists` - Cria nova lista de tarefas
- `PATCH /task-lists/:id` - Atualiza lista de tarefas
- `DELETE /task-lists/:id` - Remove lista de tarefas

### Tasks (`/tasks`)

- `POST /tasks` - Cria nova tarefa
- `PATCH /tasks/:id` - Atualiza tarefa
- `PATCH /tasks/:id/toggle` - Alterna status de conclusão
- `DELETE /tasks/:id` - Remove tarefa

### Usuários (`/users`)

- `POST /users` - Cria novo usuário
- `GET /users` - Lista todos os usuários
- `GET /users/:id` - Busca usuário por ID
- `PATCH /users/:id` - Atualiza usuário
- `DELETE /users/:id` - Remove usuário

### IA (`/ai`)

- `POST /ai/generate-tasklist` - **Gera lista completa de tarefas com IA**
- `GET /ai/providers` - Lista provedores de IA disponíveis

## 📚 Documentação da API

A API possui documentação interativa completa através do **Swagger UI**:

- **Swagger UI**: `http://localhost:3001/api`
- **JSON Schema**: `http://localhost:3001/api-json`

### Funcionalidades do Swagger

- ✅ **Documentação interativa** de todos os endpoints
- ✅ **Teste de APIs** diretamente na interface
- ✅ **Exemplos de requisições** e respostas
- ✅ **Validação de dados** em tempo real
- ✅ **Esquemas de dados** detalhados
- ✅ **Códigos de status** HTTP documentados

## 🔧 Configuração

1. **Instalar dependências:**

   ```bash
   pnpm install
   ```

2. **Configurar variáveis de ambiente:**

   ```bash
   cp env.example .env
   ```

3. **Executar em desenvolvimento:**

   ```bash
   pnpm dev
   ```

4. **Acessar a documentação:**

   - Swagger UI: `http://localhost:3001/api`
   - Health Check: `http://localhost:3001/health`

## 🤖 Integração com IA

O backend suporta dois provedores de IA:

### Hugging Face (Gratuito)

- Modelo: `microsoft/DialoGPT-medium`
- Requer API Key do Hugging Face
- Ideal para testes e desenvolvimento

### OpenRouter (Pago)

- Acesso a múltiplos modelos LLM
- Modelo padrão: `openai/gpt-3.5-turbo`
- Requer API Key do OpenRouter

## 📊 Estrutura do Banco

### Tabela `users`
- `id` - ID único (CUID)
- `name` - Nome do usuário (opcional)
- `isAnonymous` - Se é usuário anônimo
- `aiIntegrationType` - Tipo de integração IA (huggingface/openrouter)
- `aiToken` - Token da API de IA
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Tabela `task_lists`
- `id` - ID único (CUID)
- `userId` - ID do usuário proprietário
- `name` - Nome da lista (obrigatório)
- `description` - Descrição opcional
- `iaPrompt` - Prompt original usado pela IA
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Tabela `tasks`
- `id` - ID único (CUID)
- `listId` - ID da lista de tarefas
- `title` - Título da tarefa (obrigatório)
- `isCompleted` - Status de conclusão (boolean)
- `position` - Posição na lista (ordenação)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

## 🔄 Exemplo de Uso

### Listar todas as listas com tasks (endpoint principal)

```bash
curl -X GET http://localhost:3001/task-lists \
  -H "Authorization: Bearer user-123"
```

### Criar nova lista de tarefas

```bash
curl -X POST http://localhost:3001/task-lists \
  -H "Authorization: Bearer user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Viagem para o Japão",
    "description": "Planejamento completo da viagem"
  }'
```

### Criar tarefa em uma lista

```bash
curl -X POST http://localhost:3001/tasks \
  -H "Authorization: Bearer user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "listId": "list-123",
    "title": "Pesquisar voos",
    "position": 1
  }'
```

### Gerar lista completa com IA

```bash
curl -X POST "http://localhost:3001/ai/generate-tasklist?userId=user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "planejar uma viagem para o Japão",
    "provider": "huggingface"
  }'
```

## 🏗️ Arquitetura

```text
src/
├── main.ts                    # Ponto de entrada da aplicação
├── app.module.ts              # Módulo principal
├── config/                    # Configurações da aplicação
├── database/                  # Configuração do banco (Prisma)
├── health/                    # Health check endpoint
├── users/                     # Módulo de usuários
│   ├── dto/                   # DTOs de validação
│   ├── users.service.ts       # Lógica de negócios
│   ├── users.controller.ts     # Endpoints REST
│   └── users.module.ts         # Configuração do módulo
├── task-lists/                # Módulo de listas de tarefas
│   ├── dto/                   # DTOs de validação
│   ├── task-lists.service.ts  # Lógica de negócios
│   ├── task-lists.controller.ts # Endpoints REST
│   └── task-lists.module.ts   # Configuração do módulo
├── tasks/                     # Módulo de tarefas individuais
│   ├── dto/                   # DTOs de validação
│   ├── tasks.service.ts       # Lógica de negócios
│   ├── tasks.controller.ts    # Endpoints REST
│   └── tasks.module.ts        # Configuração do módulo
└── ai/                        # Módulo de IA
    ├── dto/                   # DTOs de IA
    ├── services/              # Serviços de integração IA
    ├── parsers/               # Parsers de resposta IA
    ├── ai.service.ts          # Lógica de negócios IA
    ├── ai.controller.ts       # Endpoints de IA
    └── ai.module.ts           # Configuração do módulo
```

## 🔒 Segurança

- Validação de entrada com class-validator
- Sanitização de dados
- CORS configurado para domínios específicos
- Timeout nas requisições para APIs externas

## 📝 Logs

O sistema registra:

- Criação de tarefas via IA
- Erros de integração com APIs externas
- Operações de banco de dados (em desenvolvimento)
