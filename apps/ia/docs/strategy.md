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



## Por que Python para criar um Agentic AI?

Para a criação de um *Agentic AI* (IA com agentes), uma classe de sistemas de inteligência artificial projetados para agir de forma autônoma para atingir objetivos, a escolha da linguagem de programação é uma decisão fundamental. Embora TypeScript (TS) e JavaScript (JS) sejam potentes, especialmente no desenvolvimento web, Python se destaca como a opção superior para o núcleo de um *Agentic AI*. Aqui estão 10 motivos para essa preferência:

### 1. Ecossistema de IA e Machine Learning Inigualável
Python é o padrão de fato para o desenvolvimento de IA e *Machine Learning*. A maturidade e a abrangência de suas bibliotecas são incomparáveis. Frameworks como **LangChain** e **LlamaIndex**, essenciais para a construção de agentes que interagem com modelos de linguagem (LLMs), são desenvolvidos primariamente em Python. Ferramentas de aprendizado de máquina como **TensorFlow**, **PyTorch** e **scikit-learn** são mais robustas, possuem mais recursos e têm maior suporte da comunidade em Python do que suas contrapartes em JavaScript.

### 2. Poder em Computação Científica e Manipulação de Dados
Um *Agentic AI* frequentemente precisa processar e analisar grandes volumes de dados para tomar decisões. Python domina este campo com bibliotecas como **NumPy** para operações numéricas eficientes e **Pandas** para manipulação e análise de dados estruturados. Essas ferramentas, otimizadas para performance, não têm equivalentes diretos em TS/JS em termos de funcionalidade e eficiência para tarefas de dados em larga escala.

### 3. Acesso Direto e Antecipado aos Melhores Frameworks de IA
As principais inovações em IA, especialmente em modelos de linguagem e aprendizado profundo, são lançadas com APIs e suporte "Python-first". Empresas como OpenAI, Google e Meta disponibilizam suas ferramentas e modelos mais avançados primeiramente para o ecossistema Python. Isso significa que ao usar Python, você terá acesso imediato e completo às tecnologias de ponta necessárias para construir agentes inteligentes e competitivos.

### 4. Comunidade Focada em Pesquisa e Desenvolvimento de IA
A vasta maioria da comunidade acadêmica e de pesquisa em IA utiliza Python. Isso se traduz em uma abundância de artigos, tutoriais, fóruns de discussão e soluções de problemas disponíveis. Se você encontrar um desafio complexo ao desenvolver seu agente, a probabilidade de encontrar suporte e exemplos de código relevantes na comunidade Python é muito maior.

### 5. Vasta Disponibilidade de Talentos Especializados
Devido ao seu domínio no campo da IA, o mercado de trabalho possui um número significativamente maior de desenvolvedores, engenheiros de machine learning e cientistas de dados com profunda experiência em Python para IA. Ao optar por Python, você facilita a contratação de profissionais qualificados para construir e manter seu *Agentic AI*.

### 6. Desempenho Superior para Tarefas Intensivas em CPU
A lógica de um *Agentic AI*, que envolve planejamento, raciocínio e processamento de dados, é frequentemente uma tarefa intensiva em CPU. Embora o Node.js (ambiente de execução do JS/TS) seja excelente para operações de I/O (entrada/saída), muitas das bibliotecas científicas de Python são, na verdade, invólucros para código C ou C++ de alta performance. Isso permite que Python execute cálculos matemáticos e algoritmos complexos de forma muito mais eficiente.

### 7. Simplicidade e Legibilidade para Lógica Complexa
A sintaxe de Python é conhecida por sua clareza e legibilidade, o que é uma vantagem crucial ao desenvolver os algoritmos complexos que governam o comportamento de um agente. A capacidade de expressar a lógica de planejamento e tomada de decisão de forma concisa e compreensível facilita o desenvolvimento, a depuração e a manutenção do sistema.

### 8. Ferramentas Completas para Todo o Ciclo de Vida da IA
O ecossistema Python oferece suporte para todas as etapas do desenvolvimento de um *Agentic AI*. Desde a fase de experimentação e prototipagem, com ferramentas como **Jupyter Notebooks**, até a produção e o monitoramento, com plataformas de MLOps que geralmente possuem uma integração mais robusta e nativa com Python.

### 9. Integração Perfeita com Fontes de Dados
Agentes de IA precisam interagir com uma variedade de fontes de dados, como bancos de dados, APIs e arquivos. Python possui uma coleção vasta e madura de conectores e bibliotecas para praticamente qualquer tipo de fonte de dados imaginável, tornando a tarefa de coletar as informações necessárias para a tomada de decisão do agente mais simples e direta.

### 10. Adoção Corporativa e Suporte dos Grandes Provedores de Nuvem
As principais plataformas de nuvem, como Google Cloud, AWS e Microsoft Azure, construíram seus serviços de IA e *Machine Learning* com um forte foco em Python. Seus SDKs e APIs são primariamente projetados para interagir com aplicações em Python, o que garante uma implantação e escalabilidade mais suaves e bem documentadas para o seu *Agentic AI* no ambiente de produção.

Em resumo, enquanto TS/JS são excelentes para construir as interfaces de usuário com as quais os usuários interagirão com os agentes, o "cérebro" do *Agentic AI* – sua lógica principal, capacidade de decisão e processamento de dados – é mais eficientemente e robustamente construído com Python, aproveitando seu ecossistema inigualável, desempenho em computação e o vasto suporte da comunidade de IA.