# API Documentation

## Base URL
```
http://localhost:3001
```

## 📚 Documentação Interativa (Swagger)

Para uma experiência completa de documentação e teste da API, acesse:

- **Swagger UI**: [http://localhost:3001/api](http://localhost:3001/api)
- **JSON Schema**: [http://localhost:3001/api-json](http://localhost:3001/api-json)

O Swagger UI oferece:
- ✅ Documentação interativa de todos os endpoints
- ✅ Teste de APIs diretamente na interface
- ✅ Exemplos de requisições e respostas
- ✅ Validação de dados em tempo real
- ✅ Esquemas de dados detalhados

## Endpoints

### Health Check
- **GET** `/health` - Verifica status da aplicação

### Tasks

#### Listar todas as tarefas
- **GET** `/tasks`
- **Query Parameters:**
  - `category` (optional): Filtrar por categoria

#### Listar tarefas concluídas
- **GET** `/tasks/completed`

#### Listar tarefas pendentes
- **GET** `/tasks/pending`

#### Buscar tarefa por ID
- **GET** `/tasks/:id`

#### Criar nova tarefa
- **POST** `/tasks`
- **Body:**
```json
{
  "title": "Título da tarefa",
  "description": "Descrição opcional",
  "priority": "low|medium|high",
  "category": "Categoria opcional",
  "dueDate": "2024-01-01T00:00:00.000Z"
}
```

#### Atualizar tarefa
- **PATCH** `/tasks/:id`
- **Body:** (mesmo formato do POST, todos os campos opcionais)

#### Alternar status de conclusão
- **PATCH** `/tasks/:id/toggle`

#### Deletar tarefa
- **DELETE** `/tasks/:id`

### AI Integration

#### Gerar tarefas com IA
- **POST** `/ai/generate-tasks`
- **Body:**
```json
{
  "prompt": "planejar uma viagem para o Japão",
  "apiKey": "sua-api-key-aqui",
  "provider": "huggingface|openrouter"
}
```

#### Listar provedores disponíveis
- **GET** `/ai/providers`

## Response Examples

### Task Object
```json
{
  "id": 1,
  "title": "Comprar ingredientes",
  "description": "Lista de ingredientes para o jantar",
  "isCompleted": false,
  "priority": "high",
  "category": "Compras",
  "dueDate": "2024-01-01T00:00:00.000Z",
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
