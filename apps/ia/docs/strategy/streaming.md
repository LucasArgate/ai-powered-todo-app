# Streaming

O streaming no LangGraph permite que respostas sejam transmitidas em tempo real, conforme são geradas, proporcionando uma experiência mais interativa e responsiva para o usuário. Isso é especialmente importante para aplicações que precisam de feedback imediato.

## Por que Streaming é Importante?

- **Experiência do Usuário**: Feedback imediato e interativo
- **Percepção de Performance**: Aplicação parece mais rápida
- **Engajamento**: Usuários permanecem envolvidos durante o processamento
- **Eficiência**: Não precisa esperar processamento completo para começar a mostrar resultados

## Exemplo Prático: Chatbot com Streaming de Respostas

```python
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
from langchain.chat_models import init_chat_model
from typing_extensions import TypedDict, Annotated
import operator
import asyncio
import json

# Estado do chat com streaming
class ChatState(TypedDict):
    messages: Annotated[list, operator.add]
    user_query: str
    streaming_response: str
    is_streaming: bool

# Ferramentas para o agente
@tool
def search_knowledge_base(query: str) -> str:
    """Busca informações na base de conhecimento"""
    # Simula busca em base de conhecimento
    knowledge = {
        "python": "Python é uma linguagem de programação versátil e fácil de aprender.",
        "langchain": "LangChain é um framework para construir aplicações com LLMs.",
        "streaming": "Streaming permite transmissão de dados em tempo real."
    }
    
    query_lower = query.lower()
    for key, value in knowledge.items():
        if key in query_lower:
            return value
    
    return "Informação não encontrada na base de conhecimento."

@tool
def calculate_math(expression: str) -> str:
    """Calcula expressões matemáticas simples"""
    try:
        # Simula cálculo matemático
        result = eval(expression)
        return f"Resultado: {result}"
    except:
        return "Erro no cálculo. Verifique a expressão."

# Configuração do modelo com streaming
llm = init_chat_model(
    "anthropic:claude-3-7-sonnet-latest",
    temperature=0.7
)

tools = [search_knowledge_base, calculate_math]
llm_with_tools = llm.bind_tools(tools)

def streaming_chat_node(state: ChatState):
    """Nó principal do chat com streaming"""
    
    # Prepara mensagens para o LLM
    messages = [
        {"role": "system", "content": "Você é um assistente útil. Responda de forma clara e concisa."},
        {"role": "user", "content": state["user_query"]}
    ]
    
    # Simula streaming de resposta
    response_chunks = [
        "Entendo sua pergunta sobre ",
        state["user_query"][:20] + "... ",
        "Deixe-me buscar informações relevantes. ",
        "Baseado no que encontrei, ",
        "posso te ajudar com isso. ",
        "Aqui está uma resposta detalhada: ",
        "Espero que isso seja útil!"
    ]
    
    return {
        "messages": [AIMessage(content="".join(response_chunks))],
        "streaming_response": "".join(response_chunks),
        "is_streaming": False
    }

def tool_execution_node(state: ChatState):
    """Executa ferramentas quando necessário"""
    
    # Simula execução de ferramenta
    query = state["user_query"]
    
    if any(word in query.lower() for word in ["python", "langchain", "streaming"]):
        result = search_knowledge_base(query)
    elif any(op in query for op in ["+", "-", "*", "/", "="]):
        result = calculate_math(query)
    else:
        result = "Não identifiquei uma ferramenta específica para usar."
    
    return {
        "messages": [AIMessage(content=f"🔧 Ferramenta executada: {result}")],
        "streaming_response": state["streaming_response"] + f"\n\n🔧 {result}"
    }

def route_chat(state: ChatState):
    """Roteia entre chat normal e execução de ferramentas"""
    query = state["user_query"].lower()
    
    # Se contém palavras-chave que requerem ferramentas
    if any(word in query for word in ["python", "langchain", "streaming", "+", "-", "*", "/"]):
        return "tool_execution"
    else:
        return "streaming_chat"

def create_streaming_chat_graph():
    """Cria o grafo de chat com streaming"""
    
    builder = StateGraph(ChatState)
    
    # Adiciona nós
    builder.add_node("streaming_chat", streaming_chat_node)
    builder.add_node("tool_execution", tool_execution_node)
    
    # Adiciona arestas condicionais
    builder.add_conditional_edges(
        START,
        route_chat,
        {
            "streaming_chat": "streaming_chat",
            "tool_execution": "tool_execution"
        }
    )
    
    builder.add_edge("streaming_chat", END)
    builder.add_edge("tool_execution", END)
    
    return builder.compile()

# Implementação de streaming real
class StreamingChatAgent:
    """Agente de chat com streaming real"""
    
    def __init__(self):
        self.graph = create_streaming_chat_graph()
    
    async def stream_response(self, query: str):
        """Streaming de resposta em tempo real"""
        
        print(f"👤 Usuário: {query}")
        print("🤖 Assistente: ", end="", flush=True)
        
        # Simula streaming palavra por palavra
        response_words = [
            "Entendo", "sua", "pergunta.", "Deixe-me", "processar", "isso", "para", "você.",
            "Baseado", "no", "que", "analisei,", "aqui", "está", "minha", "resposta:"
        ]
        
        full_response = ""
        for word in response_words:
            print(word, end=" ", flush=True)
            full_response += word + " "
            await asyncio.sleep(0.3)  # Simula delay de processamento
        
        # Adiciona resposta específica baseada na query
        if "python" in query.lower():
            print("\n🐍 Python é uma linguagem excelente para desenvolvimento!")
        elif "streaming" in query.lower():
            print("\n📡 Streaming permite respostas em tempo real!")
        else:
            print("\n✨ Espero ter ajudado com sua pergunta!")
        
        return full_response.strip()

# Demonstração de streaming com diferentes tipos de resposta
async def demonstrate_streaming():
    """Demonstra diferentes tipos de streaming"""
    
    agent = StreamingChatAgent()
    
    print("=== Demonstração de Streaming ===\n")
    
    # Teste 1: Streaming simples
    print("1. Streaming de Resposta Simples:")
    await agent.stream_response("O que é Python?")
    
    print("\n" + "="*50 + "\n")
    
    # Teste 2: Streaming com ferramentas
    print("2. Streaming com Execução de Ferramentas:")
    await agent.stream_response("Calcule 2 + 2")
    
    print("\n" + "="*50 + "\n")
    
    # Teste 3: Streaming de resposta longa
    print("3. Streaming de Resposta Longa:")
    await agent.stream_response("Explique streaming em detalhes")

# Implementação de streaming com LangChain real
def demonstrate_langchain_streaming():
    """Demonstra streaming usando LangChain real"""
    
    print("\n=== Streaming com LangChain ===\n")
    
    # Configuração do modelo com streaming
    llm = init_chat_model(
        "anthropic:claude-3-7-sonnet-latest",
        temperature=0.7
    )
    
    # Função para processar streaming
    def process_streaming_response(prompt: str):
        print(f"👤 Pergunta: {prompt}")
        print("🤖 Resposta (streaming): ", end="", flush=True)
        
        # Simula streaming usando yield
        response_parts = [
            "Esta é uma resposta",
            " que está sendo",
            " transmitida em",
            " tempo real",
            " usando streaming.",
            " Cada parte",
            " aparece conforme",
            " é processada!"
        ]
        
        full_response = ""
        for part in response_parts:
            print(part, end="", flush=True)
            full_response += part
            import time
            time.sleep(0.5)  # Simula delay
        
        print("\n")
        return full_response
    
    # Testa streaming
    response = process_streaming_response("Explique o que é streaming")
    print(f"📝 Resposta completa: {response}")

# Implementação de streaming com WebSocket (conceitual)
class WebSocketStreamingHandler:
    """Handler para streaming via WebSocket"""
    
    def __init__(self, websocket):
        self.websocket = websocket
    
    async def send_chunk(self, chunk: str):
        """Envia chunk via WebSocket"""
        await self.websocket.send_text(json.dumps({
            "type": "chunk",
            "content": chunk
        }))
    
    async def send_complete(self, full_response: str):
        """Envia resposta completa"""
        await self.websocket.send_text(json.dumps({
            "type": "complete",
            "content": full_response
        }))
    
    async def stream_response(self, query: str):
        """Streaming completo via WebSocket"""
        
        # Simula processamento e streaming
        response_parts = [
            "Processando sua pergunta...",
            " Analisando contexto...",
            " Gerando resposta...",
            " Aqui está o resultado!"
        ]
        
        full_response = ""
        for part in response_parts:
            await self.send_chunk(part)
            full_response += part
            await asyncio.sleep(0.5)
        
        await self.send_complete(full_response)
        return full_response

if __name__ == "__main__":
    print("=== Demonstração de Streaming no LangGraph ===\n")
    
    # Demonstração assíncrona
    asyncio.run(demonstrate_streaming())
    
    # Demonstração com LangChain
    demonstrate_langchain_streaming()
    
    print("\n=== Benefícios do Streaming ===")
    print("✅ Experiência do usuário melhorada")
    print("✅ Percepção de performance mais rápida")
    print("✅ Maior engajamento do usuário")
    print("✅ Feedback imediato durante processamento")
    print("✅ Possibilidade de cancelar operações longas")
```

## Características do Streaming

### 1. **Transmissão em Tempo Real**
- Dados enviados conforme são processados
- Não precisa esperar conclusão completa

### 2. **Chunking Inteligente**
- Divisão em pedaços lógicos (palavras, frases, parágrafos)
- Preserva contexto e legibilidade

### 3. **Controle de Fluxo**
- Possibilidade de pausar/retomar streaming
- Cancelamento de operações longas

### 4. **Múltiplos Protocolos**
- HTTP Server-Sent Events (SSE)
- WebSocket para comunicação bidirecional
- gRPC streaming

## Casos de Uso Práticos

1. **Chatbots Interativos**: Respostas aparecem conforme são geradas
2. **Assistentes de Código**: Sugestões em tempo real durante digitação
3. **Análise de Dados**: Resultados aparecem conforme são processados
4. **Tradução em Tempo Real**: Texto traduzido palavra por palavra
5. **Geração de Conteúdo**: Artigos ou código gerados progressivamente

## Implementação Técnica

### 1. **Server-Sent Events (SSE)**
```python
# Exemplo conceitual de SSE
async def stream_sse():
    async for chunk in llm.astream(prompt):
        yield f"data: {json.dumps({'content': chunk})}\n\n"
```

### 2. **WebSocket Streaming**
```python
# Exemplo conceitual de WebSocket
async def websocket_stream(websocket):
    async for chunk in llm.astream(prompt):
        await websocket.send_text(chunk)
```

### 3. **HTTP Streaming**
```python
# Exemplo conceitual de HTTP streaming
def stream_http():
    def generate():
        for chunk in llm.stream(prompt):
            yield chunk
    return Response(generate(), mimetype='text/plain')
```

## Benefícios Operacionais

- **UX Superior**: Usuários veem progresso imediato
- **Redução de Abandono**: Menos usuários desistem durante espera
- **Feedback Imediato**: Problemas detectados rapidamente
- **Escalabilidade**: Melhor uso de recursos do servidor
- **Flexibilidade**: Controle granular sobre transmissão

O streaming transforma aplicações de IA de "caixas pretas" em sistemas transparentes e interativos, essenciais para aplicações modernas que priorizam a experiência do usuário.
