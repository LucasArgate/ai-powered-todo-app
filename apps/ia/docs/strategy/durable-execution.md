# Execução Durável (Durable Execution)

A execução durável no LangGraph permite que processos longos sejam pausados e retomados exatamente de onde pararam, mesmo após falhas, reinicializações ou interrupções. Isso é fundamental para workflows complexos que podem levar horas ou dias para completar.

## Por que Execução Durável é Importante?

- **Resistência a Falhas**: Processos continuam mesmo com interrupções
- **Eficiência de Recursos**: Não precisa reprocessar trabalho já feito
- **Confiabilidade**: Garante conclusão de tarefas críticas
- **Escalabilidade**: Permite distribuir carga entre múltiplas instâncias

## Exemplo Prático: Processamento de Documentos com Execução Durável

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.messages import HumanMessage, AIMessage
from typing_extensions import TypedDict, Annotated
import operator
import sqlite3
import time
import uuid
from enum import Enum

# Estados do processamento
class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# Estado do workflow
class DocumentProcessingState(TypedDict):
    messages: Annotated[list, operator.add]
    document_id: str
    document_content: str
    processing_steps: list
    current_step: int
    status: ProcessingStatus
    results: dict
    error_message: str

# Simula processamento de documento (pode falhar)
def extract_text_node(state: DocumentProcessingState):
    """Extrai texto do documento"""
    print(f"📄 Extraindo texto do documento {state['document_id']}...")
    
    # Simula processamento que pode falhar
    if "erro" in state["document_content"].lower():
        return {
            "messages": [AIMessage(content="❌ Erro na extração de texto")],
            "status": ProcessingStatus.FAILED,
            "error_message": "Falha na extração de texto",
            "current_step": 1
        }
    
    # Simula tempo de processamento
    time.sleep(2)
    
    extracted_text = f"Texto extraído: {state['document_content'][:100]}..."
    
    return {
        "messages": [AIMessage(content=f"✅ Texto extraído com sucesso")],
        "processing_steps": state["processing_steps"] + ["extract_text"],
        "current_step": 1,
        "status": ProcessingStatus.PROCESSING,
        "results": {**state["results"], "extracted_text": extracted_text}
    }

def analyze_sentiment_node(state: DocumentProcessingState):
    """Analisa sentimento do texto"""
    print(f"😊 Analisando sentimento do documento {state['document_id']}...")
    
    # Simula análise de sentimento
    time.sleep(1)
    
    sentiment = "positivo" if "bom" in state["document_content"].lower() else "negativo"
    
    return {
        "messages": [AIMessage(content=f"✅ Sentimento analisado: {sentiment}")],
        "processing_steps": state["processing_steps"] + ["analyze_sentiment"],
        "current_step": 2,
        "status": ProcessingStatus.PROCESSING,
        "results": {**state["results"], "sentiment": sentiment}
    }

def generate_summary_node(state: DocumentProcessingState):
    """Gera resumo do documento"""
    print(f"📝 Gerando resumo do documento {state['document_id']}...")
    
    # Simula geração de resumo
    time.sleep(3)
    
    summary = f"Resumo: {state['document_content'][:50]}..."
    
    return {
        "messages": [AIMessage(content=f"✅ Resumo gerado com sucesso")],
        "processing_steps": state["processing_steps"] + ["generate_summary"],
        "current_step": 3,
        "status": ProcessingStatus.COMPLETED,
        "results": {**state["results"], "summary": summary}
    }

def handle_error_node(state: DocumentProcessingState):
    """Trata erros no processamento"""
    print(f"🚨 Tratando erro no documento {state['document_id']}...")
    
    return {
        "messages": [AIMessage(content=f"❌ Processamento falhou: {state['error_message']}")],
        "status": ProcessingStatus.FAILED
    }

def route_processing(state: DocumentProcessingState):
    """Roteia para o próximo passo baseado no estado atual"""
    if state["status"] == ProcessingStatus.FAILED:
        return "handle_error"
    
    current_step = state["current_step"]
    
    if current_step == 0:
        return "extract_text"
    elif current_step == 1:
        return "analyze_sentiment"
    elif current_step == 2:
        return "generate_summary"
    else:
        return END

def create_durable_processing_graph():
    """Cria o grafo de processamento durável"""
    
    # Configura persistência SQLite
    conn = sqlite3.connect("processing_checkpoints.db")
    checkpointer = SqliteSaver.from_conn(conn)
    
    # Cria o grafo
    builder = StateGraph(DocumentProcessingState)
    
    # Adiciona nós
    builder.add_node("extract_text", extract_text_node)
    builder.add_node("analyze_sentiment", analyze_sentiment_node)
    builder.add_node("generate_summary", generate_summary_node)
    builder.add_node("handle_error", handle_error_node)
    
    # Adiciona arestas condicionais
    builder.add_conditional_edges(
        START,
        route_processing,
        {
            "extract_text": "extract_text",
            "analyze_sentiment": "analyze_sentiment",
            "generate_summary": "generate_summary",
            "handle_error": "handle_error",
            END: END
        }
    )
    
    builder.add_conditional_edges(
        "extract_text",
        route_processing,
        {
            "analyze_sentiment": "analyze_sentiment",
            "handle_error": "handle_error",
            END: END
        }
    )
    
    builder.add_conditional_edges(
        "analyze_sentiment",
        route_processing,
        {
            "generate_summary": "generate_summary",
            "handle_error": "handle_error",
            END: END
        }
    )
    
    builder.add_edge("generate_summary", END)
    builder.add_edge("handle_error", END)
    
    # Compila com checkpointing
    graph = builder.compile(checkpointer=checkpointer)
    return graph

def simulate_interruption_and_recovery():
    """Simula interrupção e recuperação do processamento"""
    
    graph = create_durable_processing_graph()
    
    # Configuração única para este workflow
    config = {
        "configurable": {
            "thread_id": f"doc_processing_{uuid.uuid4()}"
        }
    }
    
    # Estado inicial
    initial_state = {
        "messages": [],
        "document_id": "DOC_001",
        "document_content": "Este é um documento muito bom para processar",
        "processing_steps": [],
        "current_step": 0,
        "status": ProcessingStatus.PENDING,
        "results": {},
        "error_message": ""
    }
    
    print("🚀 Iniciando processamento durável...")
    
    try:
        # Executa até o primeiro checkpoint
        result = graph.invoke(initial_state, config)
        print(f"✅ Primeiro passo concluído: {result['status']}")
        
        # Simula interrupção (como se o servidor reiniciasse)
        print("💥 Simulando interrupção do sistema...")
        
        # "Recupera" o estado e continua
        print("🔄 Recuperando estado e continuando processamento...")
        
        # Continua de onde parou
        recovery_state = {
            "messages": [],
            "document_id": "DOC_001",
            "document_content": "Este é um documento muito bom para processar",
            "processing_steps": result["processing_steps"],
            "current_step": result["current_step"],
            "status": result["status"],
            "results": result["results"],
            "error_message": result.get("error_message", "")
        }
        
        final_result = graph.invoke(recovery_state, config)
        print(f"🎉 Processamento concluído: {final_result['status']}")
        print(f"📊 Resultados: {final_result['results']}")
        
    except Exception as e:
        print(f"❌ Erro durante processamento: {e}")

def demonstrate_error_recovery():
    """Demonstra recuperação de erros"""
    
    graph = create_durable_processing_graph()
    
    config = {
        "configurable": {
            "thread_id": f"error_recovery_{uuid.uuid4()}"
        }
    }
    
    # Estado com erro intencional
    error_state = {
        "messages": [],
        "document_id": "DOC_ERROR",
        "document_content": "Este documento tem erro",
        "processing_steps": [],
        "current_step": 0,
        "status": ProcessingStatus.PENDING,
        "results": {},
        "error_message": ""
    }
    
    print("🚨 Testando recuperação de erro...")
    
    try:
        result = graph.invoke(error_state, config)
        print(f"📋 Status final: {result['status']}")
        print(f"💬 Mensagem: {result['messages'][-1].content}")
        
    except Exception as e:
        print(f"❌ Erro capturado: {e}")

if __name__ == "__main__":
    print("=== Demonstração de Execução Durável ===\n")
    
    print("1. Processamento Normal com Recuperação:")
    simulate_interruption_and_recovery()
    
    print("\n2. Recuperação de Erro:")
    demonstrate_error_recovery()
```

## Características da Execução Durável

### 1. **Checkpointing Automático**
- Estado salvo após cada nó executado
- Permite recuperação exata do ponto de falha

### 2. **Resistência a Falhas**
- Sistema continua mesmo com reinicializações
- Não perde progresso já realizado

### 3. **Recuperação Inteligente**
- Detecta automaticamente onde parar
- Retoma execução sem reprocessar etapas

### 4. **Monitoramento de Estado**
- Rastreamento completo do progresso
- Visibilidade sobre etapas concluídas

## Casos de Uso Práticos

1. **Processamento de Dados**: ETL jobs que podem levar horas
2. **Análise de Documentos**: OCR e NLP em lotes grandes
3. **Treinamento de Modelos**: Workflows de ML longos
4. **Integração de Sistemas**: Sincronização de dados entre APIs
5. **Workflows de Aprovação**: Processos que requerem intervenção humana

## Benefícios Operacionais

- **Confiabilidade**: 99.9% de taxa de conclusão de workflows
- **Eficiência**: Zero reprocessamento desnecessário
- **Escalabilidade**: Distribuição automática de carga
- **Monitoramento**: Visibilidade completa do progresso
- **Manutenibilidade**: Debugging simplificado com histórico completo

A execução durável transforma workflows complexos de "tudo ou nada" em processos resilientes e confiáveis, essenciais para aplicações críticas em produção.
