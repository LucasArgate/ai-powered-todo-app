# Persistência

[← Voltar para Strategy](../strategy.md)

A persistência no LangGraph refere-se à capacidade de salvar e recuperar o estado de um agente entre diferentes execuções. Isso é fundamental para aplicações que precisam manter contexto ao longo do tempo, como chatbots, assistentes virtuais ou sistemas de workflow.

## Por que Persistência é Importante?

- **Continuidade**: Permite que agentes mantenham contexto entre sessões
- **Recuperação**: Possibilita retomar execuções interrompidas
- **Escalabilidade**: Suporta múltiplas instâncias do mesmo agente
- **Auditoria**: Facilita rastreamento e debugging de execuções

## Exemplo Prático: Todo List com Persistência

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.messages import HumanMessage, AIMessage
from typing_extensions import TypedDict, Annotated
import operator
import sqlite3

# Define o estado do agente
class TodoState(TypedDict):
    messages: Annotated[list, operator.add]
    todos: list
    user_id: str

# Função para adicionar todo
def add_todo_node(state: TodoState):
    """Adiciona uma nova tarefa baseada na mensagem do usuário"""
    last_message = state["messages"][-1].content
    
    # Extrai a tarefa da mensagem (simplificado)
    if "adicionar" in last_message.lower() or "add" in last_message.lower():
        task = last_message.replace("adicionar", "").replace("add", "").strip()
        new_todo = {
            "id": len(state["todos"]) + 1,
            "task": task,
            "completed": False
        }
        
        updated_todos = state["todos"] + [new_todo]
        
        return {
            "messages": [AIMessage(content=f"Tarefa '{task}' adicionada com sucesso!")],
            "todos": updated_todos
        }
    
    return {"messages": [AIMessage(content="Não entendi. Use 'adicionar [tarefa]' para adicionar uma nova tarefa.")]}

# Função para listar todos
def list_todos_node(state: TodoState):
    """Lista todas as tarefas"""
    if not state["todos"]:
        return {"messages": [AIMessage(content="Nenhuma tarefa encontrada.")]}
    
    todo_list = "\n".join([
        f"{i+1}. {'✓' if todo['completed'] else '○'} {todo['task']}"
        for i, todo in enumerate(state["todos"])
    ])
    
    return {"messages": [AIMessage(content=f"Suas tarefas:\n{todo_list}")]}

# Função para completar todo
def complete_todo_node(state: TodoState):
    """Marca uma tarefa como concluída"""
    last_message = state["messages"][-1].content
    
    # Extrai o número da tarefa (simplificado)
    try:
        task_num = int(last_message.split()[-1]) - 1
        if 0 <= task_num < len(state["todos"]):
            updated_todos = state["todos"].copy()
            updated_todos[task_num]["completed"] = True
            
            return {
                "messages": [AIMessage(content=f"Tarefa '{updated_todos[task_num]['task']}' marcada como concluída!")],
                "todos": updated_todos
            }
    except:
        pass
    
    return {"messages": [AIMessage(content="Não consegui identificar qual tarefa completar.")]}

# Função de roteamento
def route_message(state: TodoState):
    """Determina qual ação executar baseada na mensagem"""
    last_message = state["messages"][-1].content.lower()
    
    if "adicionar" in last_message or "add" in last_message:
        return "add_todo"
    elif "listar" in last_message or "list" in last_message:
        return "list_todos"
    elif "completar" in last_message or "complete" in last_message:
        return "complete_todo"
    else:
        return "add_todo"  # Default

# Configuração da persistência
def setup_persistence():
    """Configura o sistema de persistência SQLite"""
    # Cria uma conexão SQLite em memória (em produção, use arquivo)
    conn = sqlite3.connect(":memory:")
    checkpointer = SqliteSaver.from_conn(conn)
    return checkpointer

# Construção do grafo
def create_todo_graph():
    """Cria o grafo do agente de todo list"""
    
    # Configura persistência
    checkpointer = setup_persistence()
    
    # Cria o grafo
    builder = StateGraph(TodoState)
    
    # Adiciona nós
    builder.add_node("add_todo", add_todo_node)
    builder.add_node("list_todos", list_todos_node)
    builder.add_node("complete_todo", complete_todo_node)
    
    # Adiciona arestas
    builder.add_edge(START, "add_todo")
    builder.add_conditional_edges(
        "add_todo",
        route_message,
        {
            "add_todo": "add_todo",
            "list_todos": "list_todos", 
            "complete_todo": "complete_todo"
        }
    )
    builder.add_edge("list_todos", END)
    builder.add_edge("complete_todo", END)
    
    # Compila com persistência
    graph = builder.compile(checkpointer=checkpointer)
    return graph

# Exemplo de uso
def main():
    """Demonstra o uso do agente com persistência"""
    
    # Cria o grafo
    graph = create_todo_graph()
    
    # Configuração para persistir estado
    config = {
        "configurable": {
            "thread_id": "user_123"  # ID único do usuário/sessão
        }
    }
    
    # Estado inicial
    initial_state = {
        "messages": [HumanMessage(content="adicionar comprar leite")],
        "todos": [],
        "user_id": "user_123"
    }
    
    # Executa o agente
    result = graph.invoke(initial_state, config)
    print("Resultado:", result["messages"][-1].content)
    
    # Simula uma nova execução (como se fosse uma nova sessão)
    new_state = {
        "messages": [HumanMessage(content="listar tarefas")],
        "todos": [],  # Estado inicial vazio
        "user_id": "user_123"
    }
    
    # O estado anterior é recuperado automaticamente pela persistência
    result2 = graph.invoke(new_state, config)
    print("Lista de tarefas:", result2["messages"][-1].content)

if __name__ == "__main__":
    main()
```

## Características da Persistência

### 1. **Checkpointing Automático**
- O estado é salvo automaticamente após cada nó
- Permite recuperação exata do ponto de interrupção

### 2. **Thread ID**
- Cada execução tem um identificador único
- Permite múltiplas sessões simultâneas

### 3. **Backends Flexíveis**
- SQLite (desenvolvimento)
- PostgreSQL (produção)
- Redis (alta performance)

### 4. **Recuperação de Estado**
- Estado completo é restaurado
- Inclui histórico de mensagens e dados do agente

## Benefícios Práticos

1. **Experiência Contínua**: Usuários podem retomar conversas onde pararam
2. **Confiabilidade**: Sistema resiste a falhas e reinicializações
3. **Escalabilidade**: Múltiplas instâncias compartilham estado
4. **Debugging**: Histórico completo de execuções para análise

A persistência é essencial para criar agentes robustos e confiáveis que podem operar em ambientes de produção com alta disponibilidade.
