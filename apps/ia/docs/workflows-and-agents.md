# Workflows e Agentes

Este guia revisa padrões comuns de workflows e agentes, explicando as diferenças fundamentais e quando usar cada abordagem.

![Agent Workflow](./images/agent_workflow.avif)

## Diferenças Fundamentais

### Workflows

- **Caminhos de código predeterminados**: Operam em uma ordem específica e bem definida
- **Estrutura fixa**: Seguem um fluxo linear ou condicional predefinido
- **Previsibilidade**: Comportamento determinístico baseado em regras claras
- **Casos de uso**: Tarefas bem estruturadas que podem ser divididas em etapas sequenciais

### Agentes

- **Processos dinâmicos**: Definem seus próprios processos e uso de ferramentas
- **Autonomia**: Tomam decisões sobre quais ferramentas usar e como resolver problemas
- **Adaptabilidade**: Comportamento emergente baseado no contexto e estado atual
- **Casos de uso**: Problemas complexos e imprevisíveis que requerem raciocínio dinâmico

## Configuração Básica

Para construir workflows ou agentes, você pode usar qualquer modelo de chat que suporte outputs estruturados e chamadas de ferramentas. O exemplo a seguir usa Anthropic:

### 1. Instalar dependências

```bash
pip install langchain_core langchain-anthropic langgraph
```

### 2. Inicializar o LLM

```python
import os
import getpass
from langchain_anthropic import ChatAnthropic

def _set_env(var: str):
    if not os.environ.get(var):
        os.environ[var] = getpass.getpass(f"{var}: ")

_set_env("ANTHROPIC_API_KEY")

llm = ChatAnthropic(model="claude-3-5-sonnet-latest")
```

## LLMs e Aumentações (RAG)

![Augmented LLM](./images/augmented_llm.avif)

Workflows e sistemas agenticos são baseados em LLMs e nas várias aumentações que você adiciona a eles. [Tool calling](/oss/python/langchain/tools), [structured outputs](/oss/python/langchain/structured-output), e [short term memory](/oss/python/langchain/short-term-memory) são algumas opções para adaptar LLMs às suas necessidades.

### Exemplo de Aumentações

```python
# Schema para output estruturado
from pydantic import BaseModel, Field

class SearchQuery(BaseModel):
    search_query: str = Field(None, description="Query that is optimized web search.")
    justification: str = Field(
        None, description="Why this query is relevant to the user's request."
    )

# Aumentar o LLM com schema para output estruturado
structured_llm = llm.with_structured_output(SearchQuery)

# Invocar o LLM aumentado
output = structured_llm.invoke("How does Calcium CT score relate to high cholesterol?")

# Definir uma ferramenta
def multiply(a: int, b: int) -> int:
    return a * b

# Aumentar o LLM com ferramentas
llm_with_tools = llm.bind_tools([multiply])

# Invocar o LLM com input que aciona a chamada da ferramenta
msg = llm_with_tools.invoke("What is 2 times 3?")

# Obter a chamada da ferramenta
msg.tool_calls
```

## Padrões de Workflow

### 1. Prompt Chaining (Encadeamento de Prompts)

![Prompt Chain](./images/prompt_chain.avif)

Prompt chaining é quando cada chamada LLM processa a saída da chamada anterior. É frequentemente usado para realizar tarefas bem definidas que podem ser divididas em etapas menores e verificáveis.

**Exemplos de uso:**

- Traduzir documentos para diferentes idiomas
- Verificar conteúdo gerado para consistência

```python
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

# Estado do grafo
class State(TypedDict):
    topic: str
    joke: str
    improved_joke: str
    final_joke: str

# Nós
def generate_joke(state: State):
    """Primeira chamada LLM para gerar piada inicial"""
    msg = llm.invoke(f"Write a short joke about {state['topic']}")
    return {"joke": msg.content}

def check_punchline(state: State):
    """Função gate para verificar se a piada tem punchline"""
    if "?" in state["joke"] or "!" in state["joke"]:
        return "Pass"
    return "Fail"

def improve_joke(state: State):
    """Segunda chamada LLM para melhorar a piada"""
    msg = llm.invoke(f"Make this joke funnier by adding wordplay: {state['joke']}")
    return {"improved_joke": msg.content}

def polish_joke(state: State):
    """Terceira chamada LLM para polimento final"""
    msg = llm.invoke(f"Add a surprising twist to this joke: {state['improved_joke']}")
    return {"final_joke": msg.content}

# Construir workflow
workflow = StateGraph(State)

# Adicionar nós
workflow.add_node("generate_joke", generate_joke)
workflow.add_node("improve_joke", improve_joke)
workflow.add_node("polish_joke", polish_joke)

# Adicionar arestas para conectar nós
workflow.add_edge(START, "generate_joke")
workflow.add_conditional_edges(
    "generate_joke", check_punchline, {"Fail": "improve_joke", "Pass": END}
)
workflow.add_edge("improve_joke", "polish_joke")
workflow.add_edge("polish_joke", END)

# Compilar
chain = workflow.compile()
```

### 2. Paralelização

![Parallelization](./images/parallelization.avif)

Com paralelização, LLMs trabalham simultaneamente em uma tarefa. Isso é feito executando múltiplas subtarefas independentes ao mesmo tempo, ou executando a mesma tarefa múltiplas vezes para verificar diferentes saídas.

**Casos de uso comuns:**

- Dividir subtarefas e executá-las em paralelo (aumenta velocidade)
- Executar tarefas múltiplas vezes para verificar diferentes saídas (aumenta confiança)

```python
# Estado do grafo
class State(TypedDict):
    topic: str
    joke: str
    story: str
    poem: str
    combined_output: str

# Nós
def call_llm_1(state: State):
    """Primeira chamada LLM para gerar piada inicial"""
    msg = llm.invoke(f"Write a joke about {state['topic']}")
    return {"joke": msg.content}

def call_llm_2(state: State):
    """Segunda chamada LLM para gerar história"""
    msg = llm.invoke(f"Write a story about {state['topic']}")
    return {"story": msg.content}

def call_llm_3(state: State):
    """Terceira chamada LLM para gerar poema"""
    msg = llm.invoke(f"Write a poem about {state['topic']}")
    return {"poem": msg.content}

def aggregator(state: State):
    """Combinar a piada e história em uma única saída"""
    combined = f"Here's a story, joke, and poem about {state['topic']}!\n\n"
    combined += f"STORY:\n{state['story']}\n\n"
    combined += f"JOKE:\n{state['joke']}\n\n"
    combined += f"POEM:\n{state['poem']}"
    return {"combined_output": combined}

# Construir workflow
parallel_builder = StateGraph(State)

# Adicionar nós
parallel_builder.add_node("call_llm_1", call_llm_1)
parallel_builder.add_node("call_llm_2", call_llm_2)
parallel_builder.add_node("call_llm_3", call_llm_3)
parallel_builder.add_node("aggregator", aggregator)

# Adicionar arestas para conectar nós
parallel_builder.add_edge(START, "call_llm_1")
parallel_builder.add_edge(START, "call_llm_2")
parallel_builder.add_edge(START, "call_llm_3")
parallel_builder.add_edge("call_llm_1", "aggregator")
parallel_builder.add_edge("call_llm_2", "aggregator")
parallel_builder.add_edge("call_llm_3", "aggregator")
parallel_builder.add_edge("aggregator", END)

parallel_workflow = parallel_builder.compile()
```

### 3. Routing (Roteamento)

![Routing](./images/routing.avif)

Workflows de roteamento processam entradas e depois as direcionam para tarefas específicas do contexto. Isso permite definir fluxos especializados para tarefas complexas.

```python
from typing_extensions import Literal
from langchain_core.messages import HumanMessage, SystemMessage

# Schema para output estruturado para usar como lógica de roteamento
class Route(BaseModel):
    step: Literal["poem", "story", "joke"] = Field(
        None, description="The next step in the routing process"
    )

# Aumentar o LLM com schema para output estruturado
router = llm.with_structured_output(Route)

# Estado
class State(TypedDict):
    input: str
    decision: str
    output: str

# Nós
def llm_call_router(state: State):
    """Roteia a entrada para o nó apropriado"""
    decision = router.invoke(
        [
            SystemMessage(
                content="Route the input to story, joke, or poem based on the user's request."
            ),
            HumanMessage(content=state["input"]),
        ]
    )
    return {"decision": decision.step}

# Função de aresta condicional para rotear para o nó apropriado
def route_decision(state: State):
    if state["decision"] == "story":
        return "llm_call_1"
    elif state["decision"] == "joke":
        return "llm_call_2"
    elif state["decision"] == "poem":
        return "llm_call_3"
```

### 4. Orchestrator-Worker

![Worker](./images/worker.avif)

Em uma configuração orchestrator-worker, o orquestrador:
- Divide tarefas em subtarefas
- Delega subtarefas para trabalhadores
- Sintetiza saídas dos trabalhadores em um resultado final

```python
from langgraph.types import Send
from typing import Annotated, List
import operator

# Schema para output estruturado para usar no planejamento
class Section(BaseModel):
    name: str = Field(description="Name for this section of the report.")
    description: str = Field(
        description="Brief overview of the main topics and concepts to be covered in this section."
    )

class Sections(BaseModel):
    sections: List[Section] = Field(description="Sections of the report.")

# Aumentar o LLM com schema para output estruturado
planner = llm.with_structured_output(Sections)

# Estado do grafo
class State(TypedDict):
    topic: str  # Tópico do relatório
    sections: list[Section]  # Lista de seções do relatório
    completed_sections: Annotated[
        list, operator.add
    ]  # Todos os trabalhadores escrevem nesta chave em paralelo
    final_report: str  # Relatório final

# Estado do trabalhador
class WorkerState(TypedDict):
    section: Section
    completed_sections: Annotated[list, operator.add]

# Nós
def orchestrator(state: State):
    """Orquestrador que gera um plano para o relatório"""
    report_sections = planner.invoke(
        [
            SystemMessage(content="Generate a plan for the report."),
            HumanMessage(content=f"Here is the report topic: {state['topic']}"),
        ]
    )
    return {"sections": report_sections.sections}

def llm_call(state: WorkerState):
    """Trabalhador escreve uma seção do relatório"""
    section = llm.invoke(
        [
            SystemMessage(
                content="Write a report section following the provided name and description. Include no preamble for each section. Use markdown formatting."
            ),
            HumanMessage(
                content=f"Here is the section name: {state['section'].name} and description: {state['section'].description}"
            ),
        ]
    )
    return {"completed_sections": [section.content]}

def synthesizer(state: State):
    """Sintetizar relatório completo das seções"""
    completed_sections = state["completed_sections"]
    completed_report_sections = "\n\n---\n\n".join(completed_sections)
    return {"final_report": completed_report_sections}

# Função de aresta condicional para criar trabalhadores llm_call
def assign_workers(state: State):
    """Atribuir um trabalhador para cada seção no plano"""
    return [Send("llm_call", {"section": s}) for s in state["sections"]]
```

### 5. Evaluator-Optimizer

![Evaluator Optimizer](./images/evaluator_optimizer.avif)

Em workflows evaluator-optimizer, uma chamada LLM cria uma resposta e a outra avalia essa resposta. Se o avaliador determinar que a resposta precisa de refinamento, feedback é fornecido e a resposta é recriada.

```python
# Schema para output estruturado para usar na avaliação
class Feedback(BaseModel):
    grade: Literal["funny", "not funny"] = Field(
        description="Decide if the joke is funny or not.",
    )
    feedback: str = Field(
        description="If the joke is not funny, provide feedback on how to improve it.",
    )

# Aumentar o LLM com schema para output estruturado
evaluator = llm.with_structured_output(Feedback)

# Estado do grafo
class State(TypedDict):
    joke: str
    topic: str
    feedback: str
    funny_or_not: str

# Nós
def llm_call_generator(state: State):
    """LLM gera uma piada"""
    if state.get("feedback"):
        msg = llm.invoke(
            f"Write a joke about {state['topic']} but take into account the feedback: {state['feedback']}"
        )
    else:
        msg = llm.invoke(f"Write a joke about {state['topic']}")
    return {"joke": msg.content}

def llm_call_evaluator(state: State):
    """LLM avalia a piada"""
    grade = evaluator.invoke(f"Grade the joke {state['joke']}")
    return {"funny_or_not": grade.grade, "feedback": grade.feedback}

# Função de aresta condicional para rotear de volta ao gerador de piadas ou terminar
def route_joke(state: State):
    if state["funny_or_not"] == "funny":
        return "Accepted"
    elif state["funny_or_not"] == "not funny":
        return "Rejected + Feedback"
```

## Agentes

![Agent](./images/agent.avif)

Agentes são tipicamente implementados como um LLM realizando ações usando [ferramentas](/oss/python/langchain/tools). Eles operam em loops de feedback contínuos e são usados em situações onde problemas e soluções são imprevisíveis.

- **Autonomia**: Mais autonomia que workflows
- **Tomada de decisão**: Podem fazer decisões sobre quais ferramentas usar
- **Adaptabilidade**: Comportamento emergente baseado no contexto
- **Flexibilidade**: Podem definir seus próprios processos

### Exemplo de Agente com Ferramentas

```python
from langchain_core.tools import tool
from langgraph.graph import MessagesState
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage

# Definir ferramentas
@tool
def multiply(a: int, b: int) -> int:
    """Multiply a and b."""
    return a * b

@tool
def add(a: int, b: int) -> int:
    """Adds a and b."""
    return a + b

@tool
def divide(a: int, b: int) -> float:
    """Divide a and b."""
    return a / b

# Aumentar o LLM com ferramentas
tools = [add, multiply, divide]
tools_by_name = {tool.name: tool for tool in tools}
llm_with_tools = llm.bind_tools(tools)

# Nós
def llm_call(state: MessagesState):
    """LLM decide se deve chamar uma ferramenta ou não"""
    return {
        "messages": [
            llm_with_tools.invoke(
                [
                    SystemMessage(
                        content="You are a helpful assistant tasked with performing arithmetic on a set of inputs."
                    )
                ]
                + state["messages"]
            )
        ]
    }

def tool_node(state: dict):
    """Executa a chamada da ferramenta"""
    result = []
    for tool_call in state["messages"][-1].tool_calls:
        tool = tools_by_name[tool_call["name"]]
        observation = tool.invoke(tool_call["args"])
        result.append(ToolMessage(content=observation, tool_call_id=tool_call["id"]))
    return {"messages": result}

# Função de aresta condicional para rotear para o nó da ferramenta ou terminar
def should_continue(state: MessagesState) -> Literal["tool_node", END]:
    """Decidir se devemos continuar o loop ou parar baseado se o LLM fez uma chamada de ferramenta"""
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tool_node"
    return END

# Construir workflow
agent_builder = StateGraph(MessagesState)

# Adicionar nós
agent_builder.add_node("llm_call", llm_call)
agent_builder.add_node("tool_node", tool_node)

# Adicionar arestas para conectar nós
agent_builder.add_edge(START, "llm_call")
agent_builder.add_conditional_edges(
    "llm_call",
    should_continue,
    ["tool_node", END]
)
agent_builder.add_edge("tool_node", "llm_call")

# Compilar o agente
agent = agent_builder.compile()
```

## Benefícios do LangGraph

O LangGraph oferece vários benefícios ao construir agentes e workflows, incluindo:

- **[Persistence](/oss/python/langgraph/persistence)**: Persistência de estado entre execuções
- **[Streaming](/oss/python/langgraph/streaming)**: Streaming de resultados em tempo real
- **Debugging**: Suporte para depuração e observabilidade
- **[Deployment](/oss/python/langgraph/deploy)**: Facilidade de implantação em produção

## Quando Usar Cada Abordagem

### Use Workflows quando
- Você tem um processo bem definido e previsível
- As etapas podem ser determinadas antecipadamente
- Você precisa de controle total sobre o fluxo de execução
- A tarefa pode ser dividida em etapas sequenciais claras

### Use Agentes quando
- Os problemas são complexos e imprevisíveis
- Você precisa de autonomia na tomada de decisões
- O processo pode variar baseado no contexto
- Você quer que o sistema aprenda e se adapte dinamicamente

## Conclusão

Workflows e agentes representam duas abordagens complementares para construir sistemas de IA. Workflows oferecem controle e previsibilidade, enquanto agentes fornecem flexibilidade e autonomia. A escolha entre eles depende da natureza do problema que você está tentando resolver e do nível de controle que você precisa sobre o processo de execução.

O LangGraph facilita a implementação de ambas as abordagens, fornecendo uma base sólida para construir sistemas de IA robustos e escaláveis.
