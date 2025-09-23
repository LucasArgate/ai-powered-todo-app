Realizar a solução mais simples e prática para as tecnologias pré estabelecidas, atendendo as expectativas de conhecimento e entendimento.

Arquitetura de pastas:

```
/smart-todo-list
├── apps
│   ├── backend/         # Aplicação NestJS
│   └── frontend/        # Aplicação Next.js
├── package.json         # Gerenciador do monorepo (usar pnpm)
└── README.md
```

#todo list:

1) criar api (backend)
   - garantir api com NestJs, swagger e sqlLite (DDD)
   - garantir modelagem necessária, criação de tabelas
   - garantir get, post, put, delete
   - criar testes (TDD)
  
2) criar front Next.Js
   - definir tailwind.css
   - desenhar views todo
   - fazer SDK para endpoints
   - testar front



1) api - SQLite - Modelagem de dados:
   - Como a aplicação é simples, vamos usar o metodo relacional tradicional.
   - Atender a demanda simples com o mínimo: (users, task_lists, tasks)

2) Modelagem real:
## Esquema do Banco de Dados (SQLite)

Abaixo estão os comandos `CREATE TABLE` que definem a estrutura do banco de dados relacional para esta aplicação. A modelagem foi projetada para ser normalizada, escalável e eficiente.

### Tabela: `users`
Armazena informações sobre usuários, sejam eles registrados ou anônimos.

```sql
CREATE TABLE users (
    -- Usamos TEXT para UUIDs, ideal para chaves primárias geradas pela aplicação.
    id TEXT PRIMARY KEY NOT NULL,

    -- O nome é opcional para suportar usuários anônimos.
    name TEXT,

    -- Flag para diferenciar usuários anônimos de registrados (0 = false, 1 = true).
    -- O padrão é 1, pois um novo usuário começa como anônimo.
    isAnonymous INTEGER NOT NULL DEFAULT 1,

    -- Tipo de integração de IA preferida pelo usuário ('huggingface' ou 'openrouter').
    -- NULL indica que o usuário ainda não configurou sua preferência.
    aiIntegrationType TEXT CHECK (aiIntegrationType IN ('huggingface', 'openrouter') OR aiIntegrationType IS NULL),

    -- Token/API Key do provedor de IA escolhido pelo usuário.
    -- Armazenado de forma criptografada para segurança.
    aiToken TEXT,

    -- Timestamps em formato ISO 8601 para fácil manipulação em JavaScript/TypeScript.
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Tabela: `task_lists`
Representa uma lista ou "grupo" de tarefas pertencente a um usuário.

```sql
CREATE TABLE task_lists (
    id TEXT PRIMARY KEY NOT NULL,

    -- Chave estrangeira que conecta a lista ao seu usuário dono.
    userId TEXT NOT NULL,

    -- O nome da lista é obrigatório.
    name TEXT NOT NULL,

    -- Descrição opcional para a lista.
    description TEXT,

    -- Armazena o prompt da IA, se a lista foi gerada por ela. NULL se criada manualmente.
    iaPrompt TEXT,

    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),

    -- Garante a integridade referencial. Se um usuário for deletado, suas listas também serão.
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabela: `tasks`
Armazena cada tarefa individual, que pertence a uma `task_list`.

```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,

    -- Chave estrangeira que conecta a tarefa à sua lista.
    listId TEXT NOT NULL,

    -- O conteúdo/título da tarefa.
    title TEXT NOT NULL,

    -- O estado da tarefa (0 = pendente, 1 = concluída). O padrão é 0.
    isCompleted INTEGER NOT NULL DEFAULT 0,

    -- Coluna crucial para permitir a reordenação (drag-and-drop) das tarefas pelo usuário.
    position INTEGER NOT NULL,

    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),

    -- Se uma lista for deletada, todas as suas tarefas serão deletadas em cascata.
    FOREIGN KEY (listId) REFERENCES task_lists(id) ON DELETE CASCADE
);
```


# Documentação da API (Endpoints)

Esta documentação detalha todos os endpoints disponíveis na API backend construída com NestJS. A API segue os princípios RESTful, utilizando os verbos HTTP de forma semântica e URLs baseadas em recursos.

**URL Base:** `http://localhost:3000` (exemplo para ambiente de desenvolvimento)

**Autenticação:** Para este projeto, a identificação do usuário é feita através de um header customizado em todas as requisições (exceto na criação de sessão inicial).

* **Header:** `X-User-ID`
* **Valor:** O `id` (UUID) do usuário anônimo.

---

## 1. Usuários (`/users`)

Recurso para gerenciar a sessão do usuário.

### `POST /users/session`

Obtém ou cria uma sessão para um usuário anônimo. O frontend deve enviar o `userId` salvo no `localStorage`. Se for nulo, um novo usuário é criado.

* **Corpo da Requisição:**

| Campo  | Tipo   | Descrição                                 |
| :----- | :----- | :---------------------------------------- |
| `userId` | `string` | Opcional. O UUID do `localStorage`. |

* **Exemplo de Corpo:**
    ```json
    {
      "userId": "123e4567-e89b-12d3-a456-426614174000"
    }
    ```

* **Resposta de Sucesso (201 Created):**
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "isAnonymous": true,
      "aiIntegrationType": null,
      "aiToken": null
    }
    ```

### `PATCH /users/me`

Atualiza as configurações do usuário, incluindo o tipo de integração de IA preferido.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Corpo da Requisição:**
|| Campo | Tipo | Descrição |
|| :--- | :--- | :--- |
|| `name`| `string` | Opcional. Novo nome do usuário. |
|| `aiIntegrationType`| `string` | Opcional. Tipo de IA ('huggingface' ou 'openrouter'). |
|| `aiToken`| `string` | Opcional. API Key do provedor de IA escolhido. |

* **Exemplo de Corpo:**
    ```json
    {
      "name": "João Silva",
      "aiIntegrationType": "openrouter",
      "aiToken": "sk-or-v1-abc123..."
    }
    ```

* **Resposta de Sucesso (200 OK):**
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "João Silva",
      "isAnonymous": true,
      "aiIntegrationType": "openrouter",
      "aiToken": "sk-or-v1-abc123..."
    }
    ```

---

## 2. Listas de Tarefas (`/lists`)

Recurso para gerenciar as listas de tarefas ("cards").

### `GET /lists`

Retorna todas as listas de tarefas do usuário.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id": "a1b2c3d4-...",
        "name": "Planejamento Viagem Japão",
        "description": "Roteiro e orçamento para a viagem.",
        "createdAt": "2025-09-23T20:22:59.123Z"
      }
    ]
    ```

### `GET /lists/:listId`

Retorna uma lista de tarefas específica, incluindo todas as suas tarefas.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Parâmetros de URL:**
    * `listId` (string): O ID da lista a ser buscada.
* **Resposta de Sucesso (200 OK):**
    ```json
    {
      "id": "a1b2c3d4-...",
      "name": "Planejamento Viagem Japão",
      "description": "Roteiro e orçamento para a viagem.",
      "iaPrompt": "Planejar uma viagem de 10 dias para o Japão",
      "tasks": [
        {
          "id": "e5f6g7h8-...",
          "title": "Reservar passagem aérea",
          "isCompleted": false,
          "position": 0
        },
        {
          "id": "i9j0k1l2-...",
          "title": "Pesquisar hotéis em Tóquio e Kyoto",
          "isCompleted": true,
          "position": 1
        }
      ]
    }
    ```

### `POST /lists`

Cria uma nova lista de tarefas manualmente.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Corpo da Requisição:**
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `name`| `string` | **Obrigatório.** O nome da lista. |
| `description`| `string` | Opcional. Descrição da lista. |

* **Resposta de Sucesso (201 Created):** Retorna a lista recém-criada.

### `POST /lists/generate-from-ai`

Cria uma nova lista e suas tarefas usando um prompt de IA.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Corpo da Requisição:**
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `listName`| `string` | **Obrigatório.** Nome para a nova lista. |
| `prompt`| `string` | **Obrigatório.** O objetivo para a IA. |
**Nota:** A API Key será obtida automaticamente das configurações do usuário (`aiToken`). O usuário deve ter configurado previamente seu token através do endpoint `PATCH /users/me`.

* **Resposta de Sucesso (201 Created):** Retorna a lista completa com as tarefas geradas.

### `PATCH /lists/:listId`

Atualiza o nome e/ou a descrição de uma lista.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Parâmetros de URL:**
    * `listId` (string): O ID da lista a ser atualizada.
* **Corpo da Requisição:**
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `name`| `string` | Opcional. Novo nome da lista. |
| `description`| `string` | Opcional. Nova descrição. |

* **Resposta de Sucesso (200 OK):** Retorna a lista atualizada.

### `DELETE /lists/:listId`

Deleta uma lista de tarefas e todas as suas tarefas associadas.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Parâmetros de URL:**
    * `listId` (string): O ID da lista a ser deletada.
* **Resposta de Sucesso (204 No Content):** N/A

---

## 3. Tarefas (`/lists/:listId/tasks`)

Recurso para gerenciar as tarefas individuais dentro de uma lista.

### `POST /lists/:listId/tasks`

Adiciona uma nova tarefa a uma lista específica.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Parâmetros de URL:**
    * `listId` (string): O ID da lista onde a tarefa será criada.
* **Corpo da Requisição:**
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `title`| `string` | **Obrigatório.** Texto da tarefa. |
| `position`| `number` | **Obrigatório.** Ordem da tarefa na lista. |

* **Resposta de Sucesso (201 Created):** Retorna a tarefa recém-criada.

### `PATCH /lists/:listId/tasks/:taskId`

Atualiza uma tarefa (marcar como concluída, renomear, reordenar).

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Parâmetros de URL:**
    * `listId` (string): ID da lista.
    * `taskId` (string): ID da tarefa a ser atualizada.
* **Corpo da Requisição:**
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `title`| `string` | Opcional. Novo texto da tarefa. |
| `isCompleted`| `boolean`| Opcional. Novo estado da tarefa. |
| `position`| `number` | Opcional. Nova posição na lista. |

* **Resposta de Sucesso (200 OK):** Retorna a tarefa atualizada.

### `DELETE /lists/:listId/tasks/:taskId`

Deleta uma tarefa específica.

* **Headers:**
    * `X-User-ID`: (Obrigatório) ID do usuário.
* **Parâmetros de URL:**
    * `listId` (string): ID da lista.
    * `taskId` (string): ID da tarefa a ser deletada.
* **Resposta de Sucesso (204 No Content):** N/A

