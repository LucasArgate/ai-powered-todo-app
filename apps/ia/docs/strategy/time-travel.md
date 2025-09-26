# Time Travel

[← Voltar para Strategy](../strategy.md)

Time Travel no LangGraph refere-se à capacidade de navegar e recuperar estados anteriores de um agente, permitindo análise histórica, debugging avançado e recuperação de execuções passadas. Isso é fundamental para sistemas que precisam de auditoria completa e capacidade de "desfazer" ações.

## Por que Time Travel é Importante?

- **Debugging Avançado**: Analisar exatamente o que aconteceu em cada etapa
- **Auditoria Completa**: Rastreamento detalhado de todas as ações
- **Recuperação de Estado**: Voltar a qualquer ponto anterior
- **Análise de Performance**: Entender como o sistema evoluiu ao longo do tempo
- **Compliance**: Atender requisitos de rastreabilidade e auditoria

## Exemplo Prático: Sistema de Investimentos com Time Travel

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.messages import HumanMessage, AIMessage
from typing_extensions import TypedDict, Annotated
import operator
import sqlite3
import uuid
from datetime import datetime
from enum import Enum

# Estados de investimento
class InvestmentStatus(str, Enum):
    ANALYZING = "analyzing"
    RECOMMENDING = "recommending"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"

# Estado do sistema de investimentos
class InvestmentState(TypedDict):
    messages: Annotated[list, operator.add]
    portfolio_id: str
    investment_amount: float
    risk_tolerance: str
    market_analysis: dict
    recommendations: list
    executed_trades: list
    current_portfolio: dict
    status: InvestmentStatus
    timestamp: str
    step_history: list

def market_analysis_node(state: InvestmentState):
    """Nó de análise de mercado"""
    
    print(f"📊 Analisando mercado para portfolio {state['portfolio_id']}...")
    
    # Simula análise de mercado
    market_data = {
        "stocks_trend": "bullish",
        "bonds_yield": 0.035,
        "crypto_volatility": "high",
        "economic_indicators": "positive",
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    step_info = {
        "step": "market_analysis",
        "timestamp": datetime.now().isoformat(),
        "data": market_data,
        "duration_ms": 1500
    }
    
    return {
        "messages": [AIMessage(content=f"✅ Análise de mercado concluída. Tendência: {market_data['stocks_trend']}")],
        "market_analysis": market_data,
        "step_history": state["step_history"] + [step_info],
        "status": InvestmentStatus.ANALYZING,
        "timestamp": datetime.now().isoformat()
    }

def generate_recommendations_node(state: InvestmentState):
    """Nó de geração de recomendações"""
    
    print(f"💡 Gerando recomendações para portfolio {state['portfolio_id']}...")
    
    # Simula geração de recomendações baseada na análise
    recommendations = []
    
    if state["market_analysis"]["stocks_trend"] == "bullish":
        recommendations.append({
            "asset": "S&P 500 ETF",
            "allocation": 0.4,
            "reason": "Mercado em alta",
            "risk_level": "medium"
        })
    
    if state["risk_tolerance"] == "conservative":
        recommendations.append({
            "asset": "Government Bonds",
            "allocation": 0.5,
            "reason": "Baixo risco",
            "risk_level": "low"
        })
    else:
        recommendations.append({
            "asset": "Tech Stocks",
            "allocation": 0.3,
            "reason": "Alto potencial",
            "risk_level": "high"
        })
    
    step_info = {
        "step": "generate_recommendations",
        "timestamp": datetime.now().isoformat(),
        "data": {"recommendations_count": len(recommendations)},
        "duration_ms": 2000
    }
    
    return {
        "messages": [AIMessage(content=f"✅ {len(recommendations)} recomendações geradas")],
        "recommendations": recommendations,
        "step_history": state["step_history"] + [step_info],
        "status": InvestmentStatus.RECOMMENDING,
        "timestamp": datetime.now().isoformat()
    }

def execute_trades_node(state: InvestmentState):
    """Nó de execução de trades"""
    
    print(f"⚡ Executando trades para portfolio {state['portfolio_id']}...")
    
    executed_trades = []
    for rec in state["recommendations"]:
        trade = {
            "asset": rec["asset"],
            "amount": state["investment_amount"] * rec["allocation"],
            "execution_price": 100.0,  # Simulado
            "execution_time": datetime.now().isoformat(),
            "status": "executed"
        }
        executed_trades.append(trade)
    
    step_info = {
        "step": "execute_trades",
        "timestamp": datetime.now().isoformat(),
        "data": {"trades_executed": len(executed_trades)},
        "duration_ms": 3000
    }
    
    return {
        "messages": [AIMessage(content=f"✅ {len(executed_trades)} trades executados")],
        "executed_trades": executed_trades,
        "step_history": state["step_history"] + [step_info],
        "status": InvestmentStatus.COMPLETED,
        "timestamp": datetime.now().isoformat()
    }

def route_investment(state: InvestmentState):
    """Roteia o fluxo de investimento"""
    
    if state["status"] == InvestmentStatus.ANALYZING:
        return "generate_recommendations"
    elif state["status"] == InvestmentStatus.RECOMMENDING:
        return "execute_trades"
    else:
        return END

def create_investment_graph():
    """Cria o grafo de investimentos com time travel"""
    
    # Configura persistência para time travel
    conn = sqlite3.connect("investment_history.db")
    checkpointer = SqliteSaver.from_conn(conn)
    
    builder = StateGraph(InvestmentState)
    
    # Adiciona nós
    builder.add_node("market_analysis", market_analysis_node)
    builder.add_node("generate_recommendations", generate_recommendations_node)
    builder.add_node("execute_trades", execute_trades_node)
    
    # Adiciona arestas
    builder.add_edge(START, "market_analysis")
    builder.add_conditional_edges(
        "market_analysis",
        route_investment,
        {
            "generate_recommendations": "generate_recommendations",
            END: END
        }
    )
    builder.add_conditional_edges(
        "generate_recommendations",
        route_investment,
        {
            "execute_trades": "execute_trades",
            END: END
        }
    )
    builder.add_edge("execute_trades", END)
    
    return builder.compile(checkpointer=checkpointer)

# Sistema de Time Travel
class TimeTravelSystem:
    """Sistema para navegação temporal"""
    
    def __init__(self, graph):
        self.graph = graph
        self.checkpointer = graph.checkpointer
    
    def get_execution_history(self, thread_id: str):
        """Recupera histórico completo de execução"""
        
        print(f"🕰️ Recuperando histórico para thread {thread_id}")
        
        # Simula recuperação de histórico
        history = {
            "thread_id": thread_id,
            "total_steps": 3,
            "execution_time": "00:00:06.500",
            "steps": [
                {
                    "step": 1,
                    "node": "market_analysis",
                    "timestamp": "2024-01-01T10:00:00Z",
                    "status": "completed",
                    "duration_ms": 1500
                },
                {
                    "step": 2,
                    "node": "generate_recommendations", 
                    "timestamp": "2024-01-01T10:00:01.500Z",
                    "status": "completed",
                    "duration_ms": 2000
                },
                {
                    "step": 3,
                    "node": "execute_trades",
                    "timestamp": "2024-01-01T10:00:03.500Z",
                    "status": "completed",
                    "duration_ms": 3000
                }
            ]
        }
        
        return history
    
    def travel_to_step(self, thread_id: str, step_number: int):
        """Viaja para um passo específico"""
        
        print(f"⏰ Viajando para passo {step_number} do thread {thread_id}")
        
        # Simula recuperação de estado em passo específico
        if step_number == 1:
            return {
                "status": "market_analysis_completed",
                "market_data": {"stocks_trend": "bullish"},
                "next_action": "generate_recommendations"
            }
        elif step_number == 2:
            return {
                "status": "recommendations_generated",
                "recommendations": [
                    {"asset": "S&P 500 ETF", "allocation": 0.4},
                    {"asset": "Government Bonds", "allocation": 0.5}
                ],
                "next_action": "execute_trades"
            }
        else:
            return {
                "status": "trades_executed",
                "executed_trades": 2,
                "next_action": "completed"
            }
    
    def replay_execution(self, thread_id: str, from_step: int = 1):
        """Reexecuta a partir de um passo específico"""
        
        print(f"🔄 Reexecutando thread {thread_id} a partir do passo {from_step}")
        
        # Simula reexecução
        config = {"configurable": {"thread_id": thread_id}}
        
        if from_step == 1:
            print("📊 Reexecutando análise de mercado...")
        elif from_step == 2:
            print("💡 Reexecutando geração de recomendações...")
        elif from_step == 3:
            print("⚡ Reexecutando execução de trades...")
        
        return {"status": "replay_completed", "from_step": from_step}
    
    def compare_states(self, thread_id: str, step1: int, step2: int):
        """Compara estados entre dois passos"""
        
        print(f"🔍 Comparando estados entre passos {step1} e {step2}")
        
        state1 = self.travel_to_step(thread_id, step1)
        state2 = self.travel_to_step(thread_id, step2)
        
        comparison = {
            "step1": state1,
            "step2": state2,
            "differences": [
                "Status mudou de 'analyzing' para 'recommending'",
                "Recomendações foram adicionadas",
                "Timestamp atualizado"
            ]
        }
        
        return comparison
    
    def get_performance_metrics(self, thread_id: str):
        """Analisa métricas de performance"""
        
        print(f"📈 Analisando métricas de performance para thread {thread_id}")
        
        history = self.get_execution_history(thread_id)
        
        metrics = {
            "total_execution_time": "00:00:06.500",
            "average_step_duration": "00:00:02.167",
            "slowest_step": "execute_trades (3000ms)",
            "fastest_step": "market_analysis (1500ms)",
            "efficiency_score": 0.85
        }
        
        return metrics

# Demonstração do Time Travel
def demonstrate_time_travel():
    """Demonstra capacidades de time travel"""
    
    print("=== Sistema de Investimentos com Time Travel ===\n")
    
    # Cria grafo com time travel
    graph = create_investment_graph()
    time_travel = TimeTravelSystem(graph)
    
    # Configuração única
    thread_id = f"investment_{uuid.uuid4()}"
    config = {"configurable": {"thread_id": thread_id}}
    
    # Estado inicial
    initial_state = {
        "messages": [],
        "portfolio_id": "PORTFOLIO_001",
        "investment_amount": 10000.0,
        "risk_tolerance": "conservative",
        "market_analysis": {},
        "recommendations": [],
        "executed_trades": [],
        "current_portfolio": {},
        "status": InvestmentStatus.ANALYZING,
        "timestamp": datetime.now().isoformat(),
        "step_history": []
    }
    
    print("🚀 Executando workflow de investimentos...")
    
    # Executa workflow completo
    result = graph.invoke(initial_state, config)
    
    print(f"✅ Workflow concluído: {result['status']}")
    
    # Demonstra capacidades de time travel
    print("\n" + "="*60)
    print("CAPACIDADES DE TIME TRAVEL")
    print("="*60)
    
    # 1. Histórico completo
    print("\n1. 📚 Histórico Completo de Execução:")
    history = time_travel.get_execution_history(thread_id)
    for step in history["steps"]:
        print(f"   Passo {step['step']}: {step['node']} ({step['duration_ms']}ms)")
    
    # 2. Viajar para passo específico
    print("\n2. ⏰ Viajando para Passo Específico:")
    step2_state = time_travel.travel_to_step(thread_id, 2)
    print(f"   Estado no passo 2: {step2_state['status']}")
    
    # 3. Reexecutar a partir de ponto específico
    print("\n3. 🔄 Reexecutando a partir de Passo Específico:")
    replay_result = time_travel.replay_execution(thread_id, 2)
    print(f"   Reexecução: {replay_result['status']}")
    
    # 4. Comparar estados
    print("\n4. 🔍 Comparando Estados:")
    comparison = time_travel.compare_states(thread_id, 1, 2)
    print(f"   Diferenças encontradas: {len(comparison['differences'])}")
    
    # 5. Métricas de performance
    print("\n5. 📈 Métricas de Performance:")
    metrics = time_travel.get_performance_metrics(thread_id)
    print(f"   Tempo total: {metrics['total_execution_time']}")
    print(f"   Passo mais lento: {metrics['slowest_step']}")
    print(f"   Score de eficiência: {metrics['efficiency_score']}")

# Sistema de Auditoria Temporal
class TemporalAuditSystem:
    """Sistema de auditoria com capacidades temporais"""
    
    def __init__(self):
        self.audit_log = []
    
    def log_state_change(self, thread_id: str, step: int, old_state: dict, new_state: dict):
        """Registra mudança de estado"""
        
        audit_entry = {
            "timestamp": datetime.now().isoformat(),
            "thread_id": thread_id,
            "step": step,
            "change_type": "state_transition",
            "old_state": old_state,
            "new_state": new_state,
            "changes": self._calculate_changes(old_state, new_state)
        }
        
        self.audit_log.append(audit_entry)
    
    def _calculate_changes(self, old_state: dict, new_state: dict):
        """Calcula diferenças entre estados"""
        changes = []
        
        for key in new_state:
            if key not in old_state:
                changes.append(f"Added: {key}")
            elif old_state[key] != new_state[key]:
                changes.append(f"Changed: {key}")
        
        return changes
    
    def generate_audit_report(self, thread_id: str):
        """Gera relatório de auditoria"""
        
        relevant_entries = [entry for entry in self.audit_log if entry["thread_id"] == thread_id]
        
        report = {
            "thread_id": thread_id,
            "total_changes": len(relevant_entries),
            "timeline": relevant_entries,
            "summary": f"Thread {thread_id} teve {len(relevant_entries)} mudanças de estado"
        }
        
        return report

if __name__ == "__main__":
    demonstrate_time_travel()
    
    print("\n=== Benefícios do Time Travel ===")
    print("✅ Debugging avançado com análise histórica")
    print("✅ Auditoria completa de todas as ações")
    print("✅ Recuperação de estados anteriores")
    print("✅ Análise de performance detalhada")
    print("✅ Compliance e rastreabilidade")
    print("✅ Capacidade de 'desfazer' ações")
    print("✅ Reexecução a partir de pontos específicos")
```

## Características do Time Travel

### 1. **Navegação Temporal**
- Acesso a qualquer estado anterior
- Visualização de evolução do sistema

### 2. **Reexecução Seletiva**
- Executar novamente a partir de qualquer ponto
- Testar diferentes cenários sem perder histórico

### 3. **Análise Comparativa**
- Comparar estados entre diferentes momentos
- Identificar exatamente o que mudou

### 4. **Auditoria Completa**
- Rastreamento de todas as mudanças
- Relatórios detalhados de execução

## Casos de Uso Práticos

1. **Sistemas Financeiros**: Auditoria de transações e decisões
2. **Workflows de Aprovação**: Rastreamento de mudanças de status
3. **Sistemas de IA**: Debugging de decisões do modelo
4. **Processos de Negócio**: Análise de eficiência e bottlenecks
5. **Sistemas de Compliance**: Rastreabilidade para regulamentações

## Implementação Técnica

### 1. **Checkpointing Granular**
```python
# Checkpoint após cada nó
checkpointer = SqliteSaver.from_conn(conn)
graph = builder.compile(checkpointer=checkpointer)
```

### 2. **Recuperação de Estado**
```python
# Recupera estado específico
state = graph.get_state(config, as_node="specific_node")
```

### 3. **Reexecução Condicional**
```python
# Reexecuta a partir de ponto específico
graph.invoke(state, config, as_node="starting_node")
```

## Benefícios Operacionais

- **Debugging Eficiente**: Identifica exatamente onde problemas ocorrem
- **Auditoria Robusta**: Rastreamento completo para compliance
- **Recuperação Rápida**: Volta a estados conhecidos funcionais
- **Análise de Performance**: Identifica gargalos e otimizações
- **Testes A/B**: Compara diferentes execuções
- **Rollback Seguro**: Desfaz mudanças problemáticas

O Time Travel transforma sistemas de IA de "caixas pretas" em sistemas transparentes e auditáveis, essenciais para aplicações críticas que requerem rastreabilidade completa e capacidade de recuperação.
