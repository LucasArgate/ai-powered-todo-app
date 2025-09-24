# API Documentation

## Base URL
```
http://localhost:3001
```

> **Nota:** Este projeto utiliza **SQLite** como banco de dados conforme especificado no desafio técnico, garantindo simplicidade e portabilidade.

## 📚 Documentação Interativa (Swagger + OpenAPI)

Para uma experiência completa de documentação e teste da API, acesse:

- **Swagger UI**: [http://localhost:3001/api](http://localhost:3001/api) - Interface interativa para teste e documentação
- **OpenAPI JSON**: [http://localhost:3001/api-json](http://localhost:3001/api-json) - Especificação padrão OpenAPI 3.0

### Swagger UI oferece:
- ✅ Documentação interativa de todos os endpoints
- ✅ Teste de APIs diretamente na interface
- ✅ Exemplos de requisições e respostas
- ✅ Validação de dados em tempo real
- ✅ Esquemas de dados detalhados

### OpenAPI JSON permite:
- ✅ **Integração com MCP Servers** - Facilita conexão com Model Context Protocol servers
- ✅ **Ferramentas de terceiros** - Compatível com Postman, Insomnia, etc.
- ✅ **Geração de código** - Permite gerar clientes automaticamente
- ✅ **Automação de testes** - Base para testes automatizados e CI/CD

## Endpoints

### Health Check
- **GET** `/health` - Verifica status da aplicação

### Task Lists

#### Listar todas as listas de tarefas (com tasks incluídas)
- **GET** `/task-lists`
- **Headers:** `Authorization: Bearer <user-id>`
- **Response:** Retorna todas as listas do usuário com suas tasks, contadores e informações completas

#### Criar nova lista de tarefas
- **POST** `/task-lists`
- **Headers:** `Authorization: Bearer <user-id>`
- **Body:**
```json
{
  "name": "Nome da lista",
  "description": "Descrição opcional",
  "iaPrompt": "Prompt original (se gerado por IA)"
}
```

#### Atualizar lista de tarefas
- **PATCH** `/task-lists/:id`
- **Headers:** `Authorization: Bearer <user-id>`
- **Body:** (mesmo formato do POST, todos os campos opcionais)

#### Deletar lista de tarefas
- **DELETE** `/task-lists/:id`
- **Headers:** `Authorization: Bearer <user-id>`

### Tasks

> **Nota:** Para listar tasks, use o endpoint `GET /task-lists` que retorna todas as listas com suas tasks incluídas. Os endpoints de listagem individual foram removidos para simplificar a API.

#### Criar nova tarefa
- **POST** `/tasks`
- **Headers:** `Authorization: Bearer <user-id>`
- **Body:**
```json
{
  "listId": "ID da lista de tarefas",
  "title": "Título da tarefa",
  "position": 1,
  "isCompleted": false
}
```

#### Atualizar tarefa
- **PATCH** `/tasks/:id`
- **Headers:** `Authorization: Bearer <user-id>`
- **Body:** (todos os campos opcionais)

#### Alternar status de conclusão
- **PATCH** `/tasks/:id/toggle`
- **Headers:** `Authorization: Bearer <user-id>`

#### Deletar tarefa
- **DELETE** `/tasks/:id`
- **Headers:** `Authorization: Bearer <user-id>`

### Users

#### Criar usuário
- **POST** `/users`
- **Body:**
```json
{
  "name": "Nome do usuário (opcional)",
  "isAnonymous": true,
  "aiIntegrationType": "huggingface|openrouter",
  "aiToken": "token-da-api"
}
```

#### Listar todos os usuários
- **GET** `/users`

#### Listar usuários anônimos
- **GET** `/users/anonymous`

#### Listar usuários registrados
- **GET** `/users/registered`

#### Buscar usuário por ID
- **GET** `/users/:id`

#### Atualizar usuário
- **PATCH** `/users/:id`
- **Body:** (todos os campos opcionais)
```json
{
  "name": "Novo nome",
  "aiIntegrationType": "openrouter",
  "aiToken": "novo-token"
}
```
**Nota:** Se `name` for fornecido e não estiver vazio, `isAnonymous` será automaticamente definido como `false`. Se `name` estiver vazio ou não for fornecido, `isAnonymous` será `true`.

#### Deletar usuário
- **DELETE** `/users/:id`

### AI Integration

#### Gerar tarefas com IA
- **POST** `/ai/generate-tasks`
- **Headers:** `Authorization: Bearer <user-id>`
- **Body:**
```json
{
  "prompt": "planejar uma viagem para o Japão",
  "listName": "Viagem para o Japão",
  "provider": "huggingface|openrouter",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 1000
}
```
**Nota:** Se `listName` for fornecido, cria uma nova TaskList com esse nome. Caso contrário, salva as tarefas em uma lista padrão.

#### Gerar lista de tarefas completa com IA (RECOMENDADO)
- **POST** `/ai/generate-tasklist`
- **Headers:** `Authorization: Bearer <user-id>`
- **Body:**
```json
{
  "prompt": "planejar uma viagem para o Japão",
  "listName": "Viagem para o Japão",
  "provider": "huggingface|openrouter",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 1000
}
```
**Nota:** Se `listName` for fornecido, usa esse nome para a lista. Caso contrário, gera automaticamente um título usando IA.

#### Listar provedores disponíveis
- **GET** `/ai/providers`

## Response Examples

### TaskList Object (GET /task-lists response)
```json
{
  "id": "list_123",
  "name": "Viagem para o Japão",
  "description": "Planejamento completo para uma viagem ao Japão",
  "iaPrompt": "planejar viagem para Japão",
  "tasksCount": 5,
  "completedTasksCount": 2,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "tasks": [
    {
      "id": "task_1",
      "title": "Pesquisar voos",
      "isCompleted": false,
      "position": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "task_2",
      "title": "Reservar hotel",
      "isCompleted": true,
      "position": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Task Object
```json
{
  "id": "task_123",
  "title": "Pesquisar voos",
  "isCompleted": false,
  "position": 1,
  "listId": "list_123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### TaskList with Tasks (AI Generated)
```json
{
  "id": "list_123",
  "name": "Viagem para o Japão",
  "description": "Planejamento completo para uma viagem ao Japão",
  "iaPrompt": "planejar viagem para Japão",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "tasks": [
    {
      "id": "task_1",
      "title": "Pesquisar voos",
      "isCompleted": false,
      "position": 1,
      "listId": "list_123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "task_2",
      "title": "Reservar hotel",
      "isCompleted": false,
      "position": 2,
      "listId": "list_123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### User Object
```json
{
  "id": "clx1234567890",
  "name": "João Silva",
  "isAnonymous": false,
  "aiIntegrationType": "openrouter",
  "aiToken": "sk-or-v1-abc123...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### AI Providers
```json
[
  {
    "name": "huggingface",
    "description": "Hugging Face Inference API - Free tier available",
    "free": true
  },
  {
    "name": "openrouter",
    "description": "OpenRouter - Access to multiple LLMs",
    "free": false
  }
]
```

### Health Check Response
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Task with ID 999 not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```
