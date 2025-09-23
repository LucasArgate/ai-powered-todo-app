# AI-Powered Todo App - Backend

Backend API para a aplicação de lista de tarefas com IA, construído com NestJS e TypeScript.

## 🚀 Funcionalidades

- **CRUD completo de tarefas** com validação
- **Integração com IA** para geração automática de tarefas
- **Banco SQLite** com criação automática de tabelas
- **API REST** com endpoints bem estruturados
- **CORS configurado** para comunicação com frontend
- **Validação de dados** com class-validator

## 📋 Endpoints Disponíveis

### Tarefas (`/tasks`)

- `GET /tasks` - Lista todas as tarefas
- `GET /tasks/completed` - Lista tarefas concluídas
- `GET /tasks/pending` - Lista tarefas pendentes
- `GET /tasks?category=nome` - Lista tarefas por categoria
- `GET /tasks/:id` - Busca tarefa por ID
- `POST /tasks` - Cria nova tarefa
- `PATCH /tasks/:id` - Atualiza tarefa
- `PATCH /tasks/:id/toggle` - Alterna status de conclusão
- `DELETE /tasks/:id` - Remove tarefa

### IA (`/ai`)

- `POST /ai/generate-tasks` - Gera tarefas a partir de um prompt
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

A tabela `tasks` é criada automaticamente com os campos:

- `id` - ID único (auto-incremento)
- `title` - Título da tarefa (obrigatório)
- `description` - Descrição opcional
- `isCompleted` - Status de conclusão (boolean)
- `priority` - Prioridade (low/medium/high)
- `category` - Categoria da tarefa
- `dueDate` - Data de vencimento
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

## 🔄 Exemplo de Uso

### Criar tarefa manualmente

```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Comprar ingredientes",
    "description": "Lista de ingredientes para o jantar",
    "priority": "high",
    "category": "Compras"
  }'
```

### Gerar tarefas com IA

```bash
curl -X POST http://localhost:3001/ai/generate-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "planejar uma viagem para o Japão",
    "apiKey": "sua-api-key",
    "provider": "huggingface"
  }'
```

## 🏗️ Arquitetura

```text
src/
├── main.ts              # Ponto de entrada da aplicação
├── app.module.ts        # Módulo principal
├── tasks/               # Módulo de tarefas
│   ├── entities/        # Entidades do banco
│   ├── dto/             # DTOs de validação
│   ├── tasks.service.ts # Lógica de negócios
│   ├── tasks.controller.ts # Endpoints REST
│   └── tasks.module.ts  # Configuração do módulo
└── ai/                  # Módulo de IA
    ├── dto/             # DTOs de IA
    ├── ai.service.ts    # Integração com APIs de IA
    ├── ai.controller.ts # Endpoints de IA
    └── ai.module.ts     # Configuração do módulo
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
