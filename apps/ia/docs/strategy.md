## tech strategy

**Apresentar a simplicidade e praticidade de criar um Agentic, react agentic baseado em princípios sólidos:**

- Persistence
- Durable execution
- Streaming
- Human-in-the-loop
- Time travel
- Add and manage memory
- Subgraphs


### Sobre o LangGraph
LangGraph é uma estrutura de orquestração de baixo nível para criar, gerenciar e implantar agentes com estado e de longa duração. Algumas empresas que moldam o futuro dos agentes, incluindo Klarna, Replit, Elastic e outras, utilizam frameworks como LangGraph.


O LangGraph é um ambiente de nível muito baixo e focado inteiramente na orquestração de agentes. Antes de usar o LangGraph, é recomendável que você se familiarize com alguns dos componentes usados ​​para construir agentes, começando pelos modelos e ferramentas. Usaremos componentes do LangChain com frequência ao longo da documentação, mas você não precisa usar o LangChain para usar o LangGraph.


```python
# Step 0: Define tools and model

from langchain_core.tools import tool
from langchain.chat_models import init_chat_model
from typing import List, Dict, Any

llm = init_chat_model(
    "anthropic:claude-3-7-sonnet-latest",
    temperature=0
)

# In-memory storage for todos (in production, use a database)
todos_storage: List[Dict[str, Any]] = []

# Define tools for todo management
@tool
def add_todo(title: str, description: str = "") -> str:
    """Add a new todo item to the list.

    Args:
        title: The title of the todo item
        description: Optional description of the todo item
    """
    todo_id = len(todos_storage) + 1
    todo = {
        "id": todo_id,
        "title": title,
        "description": description,
        "completed": False,
        "created_at": "2024-01-01"  # In production, use datetime.now()
    }
    todos_storage.append(todo)
    return f"Todo '{title}' added successfully with ID {todo_id}"


@tool
def list_todos() -> str:
    """List all todo items."""
    if not todos_storage:
        return "No todos found. Add some todos to get started!"
    
    result = "Current todos:\n"
    for todo in todos_storage:
        status = "✓" if todo["completed"] else "○"
        result += f"{status} [{todo['id']}] {todo['title']}"
        if todo["description"]:
            result += f" - {todo['description']}"
        result += "\n"
    return result


@tool
def complete_todo(todo_id: int) -> str:
    """Mark a todo item as completed.

    Args:
        todo_id: The ID of the todo item to complete
    """
    for todo in todos_storage:
        if todo["id"] == todo_id:
            todo["completed"] = True
            return f"Todo '{todo['title']}' marked as completed!"
    return f"Todo with ID {todo_id} not found"


@tool
def delete_todo(todo_id: int) -> str:
    """Delete a todo item from the list.

    Args:
        todo_id: The ID of the todo item to delete
    """
    for i, todo in enumerate(todos_storage):
        if todo["id"] == todo_id:
            deleted_title = todo["title"]
            todos_storage.pop(i)
            return f"Todo '{deleted_title}' deleted successfully!"
    return f"Todo with ID {todo_id} not found"


# Augment the LLM with tools
tools = [add_todo, list_todos, complete_todo, delete_todo]
tools_by_name = {tool.name: tool for tool in tools}
llm_with_tools = llm.bind_tools(tools)

# Step 1: Define state

from langchain_core.messages import AnyMessage
from typing_extensions import TypedDict, Annotated
import operator

class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    llm_calls: int

# Step 2: Define model node
from langchain_core.messages import SystemMessage
def llm_call(state: dict):
    """LLM decides whether to call a tool or not"""

    return {
        "messages": [
            llm_with_tools.invoke(
                [
                    SystemMessage(
                        content="You are a helpful todo list assistant. You can help users manage their tasks by adding, listing, completing, or deleting todos. Always be friendly and helpful."
                    )
                ]
                + state["messages"]
            )
        ],
        "llm_calls": state.get('llm_calls', 0) + 1
    }


# Step 3: Define tool node

from langchain_core.messages import ToolMessage

def tool_node(state: dict):
    """Performs the tool call"""

    result = []
    for tool_call in state["messages"][-1].tool_calls:
        tool = tools_by_name[tool_call["name"]]
        observation = tool.invoke(tool_call["args"])
        result.append(ToolMessage(content=observation, tool_call_id=tool_call["id"]))
    return {"messages": result}

# Step 4: Define logic to determine whether to end

from typing import Literal
from langgraph.graph import StateGraph, START, END

# Conditional edge function to route to the tool node or end based upon whether the LLM made a tool call
def should_continue(state: MessagesState) -> Literal["tool_node", END]:
    """Decide if we should continue the loop or stop based upon whether the LLM made a tool call"""

    messages = state["messages"]
    last_message = messages[-1]
    # If the LLM makes a tool call, then perform an action
    if last_message.tool_calls:
        return "tool_node"
    # Otherwise, we stop (reply to the user)
    return END

# Step 5: Build agent

# Build workflow
agent_builder = StateGraph(MessagesState)

# Add nodes
agent_builder.add_node("llm_call", llm_call)
agent_builder.add_node("tool_node", tool_node)

# Add edges to connect nodes
agent_builder.add_edge(START, "llm_call")
agent_builder.add_conditional_edges(
    "llm_call",
    should_continue,
    ["tool_node", END]
)
agent_builder.add_edge("tool_node", "llm_call")

# Compile the agent
agent = agent_builder.compile()


from IPython.display import Image, display
# Show the agent
display(Image(agent.get_graph(xray=True).draw_mermaid_png()))

# Invoke examples
from langchain_core.messages import HumanMessage

# Example 1: Add a todo
messages = [HumanMessage(content="Add a todo to buy groceries")]
result = agent.invoke({"messages": messages})
for m in result["messages"]:
    m.pretty_print()

# Example 2: List todos
messages = [HumanMessage(content="Show me all my todos")]
result = agent.invoke({"messages": messages})
for m in result["messages"]:
    m.pretty_print()

# Example 3: Complete a todo
messages = [HumanMessage(content="Mark todo 1 as completed")]
result = agent.invoke({"messages": messages})
for m in result["messages"]:
    m.pretty_print()
```

## A Importância do LangSmith para Observabilidade

Após implementar nosso agente de todo list, surge uma questão fundamental: **como monitorar e depurar esse sistema em produção?** É aqui que o **LangSmith** se torna essencial.

### Por que Observabilidade é Crucial?

Em sistemas de IA cada vez mais autônomos e complexos, compreender o comportamento interno dos agentes é fundamental para:

- **Depuração eficiente**: Rastrear fluxos de trabalho complexos e identificar problemas como loops infinitos ou tempos de resposta lentos
- **Visibilidade completa**: Monitoramento de ponta a ponta, desde a interface do usuário até o backend
- **Explicabilidade**: Entender como os modelos tomam decisões e detectar anomalias automaticamente

### Necessidade da Observabilidade

Com agentes LangGraph executando múltiplas ferramentas e tomando decisões autônomas, a observabilidade não é mais um luxo - é uma **necessidade crítica**. Sem ela, depurar problemas em produção torna-se quase impossível, especialmente quando:

- Múltiplas ferramentas são executadas em sequência
- O estado do agente evolui dinamicamente
- Erros podem ocorrer em qualquer ponto do fluxo

### Maturidade da Observabilidade

A observabilidade evoluiu de um conceito teórico para um **pilar fundamental** nas operações modernas de IA. O LangSmith representa essa maturidade ao oferecer:

- **Tracing distribuído** para fluxos complexos de agentes
- **Métricas em tempo real** de performance e custos
- **Análise de feedback** para melhorar continuamente os agentes
- **Integração nativa** com o ecossistema LangChain

### Implementação Prática

```python
# Exemplo de integração com LangSmith
from langsmith import Client

# Configurar tracing
client = Client(api_key="your-api-key")

# O LangSmith automaticamente rastreia:
# - Chamadas para o LLM
# - Execução de ferramentas
# - Estado do agente
# - Tempos de resposta
# - Custos por operação
```

**Conclusão**: Assim como não desenvolveríamos uma aplicação web sem logs e métricas, não devemos construir agentes LangGraph sem observabilidade. O LangSmith não é apenas uma ferramenta de debugging - é o que torna possível operar agentes de IA em escala e com confiança.
