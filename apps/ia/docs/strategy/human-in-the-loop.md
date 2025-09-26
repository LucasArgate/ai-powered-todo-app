# Human-in-the-Loop

Human-in-the-Loop (HITL) no LangGraph permite que humanos intervenham em processos automatizados para validação, correção ou tomada de decisões críticas. Isso é essencial para aplicações que requerem supervisão humana ou onde a precisão é crítica.

## Por que Human-in-the-Loop é Importante?

- **Qualidade**: Humanos podem validar e corrigir resultados
- **Segurança**: Intervenção em decisões críticas ou sensíveis
- **Aprendizado**: Feedback humano melhora o sistema ao longo do tempo
- **Conformidade**: Atende regulamentações que exigem supervisão humana
- **Confiança**: Usuários confiam mais em sistemas com supervisão humana

## Exemplo Prático: Sistema de Moderação de Conteúdo com HITL

```python
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
from typing_extensions import TypedDict, Annotated
import operator
import json
from enum import Enum

# Estados de moderação
class ModerationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"

# Estado do sistema de moderação
class ModerationState(TypedDict):
    messages: Annotated[list, operator.add]
    content: str
    content_id: str
    ai_analysis: dict
    human_feedback: dict
    status: ModerationStatus
    confidence_score: float
    requires_human_review: bool

# Ferramentas de análise automática
@tool
def analyze_content_safety(content: str) -> str:
    """Analisa segurança do conteúdo usando IA"""
    
    # Simula análise de conteúdo
    risky_keywords = ["violência", "ódio", "spam", "inapropriado"]
    content_lower = content.lower()
    
    risk_score = 0
    detected_issues = []
    
    for keyword in risky_keywords:
        if keyword in content_lower:
            risk_score += 0.3
            detected_issues.append(keyword)
    
    analysis = {
        "risk_score": min(risk_score, 1.0),
        "detected_issues": detected_issues,
        "recommendation": "APPROVE" if risk_score < 0.5 else "REVIEW"
    }
    
    return json.dumps(analysis)

@tool
def check_content_policy(content: str) -> str:
    """Verifica conformidade com políticas"""
    
    # Simula verificação de políticas
    policy_violations = []
    
    if len(content) > 1000:
        policy_violations.append("Conteúdo muito longo")
    
    if content.count("!") > 5:
        policy_violations.append("Muitos pontos de exclamação")
    
    if "@" in content and "http" in content:
        policy_violations.append("Possível spam")
    
    policy_check = {
        "violations": policy_violations,
        "compliant": len(policy_violations) == 0
    }
    
    return json.dumps(policy_check)

def ai_analysis_node(state: ModerationState):
    """Nó de análise automática por IA"""
    
    print(f"🤖 Analisando conteúdo {state['content_id']} com IA...")
    
    # Executa análises automáticas
    safety_analysis = json.loads(analyze_content_safety(state["content"]))
    policy_check = json.loads(check_content_policy(state["content"]))
    
    # Calcula score de confiança
    confidence = 1.0 - safety_analysis["risk_score"]
    
    # Determina se precisa de revisão humana
    needs_human = (
        safety_analysis["risk_score"] > 0.3 or 
        not policy_check["compliant"] or
        confidence < 0.7
    )
    
    ai_analysis = {
        "safety": safety_analysis,
        "policy": policy_check,
        "confidence": confidence,
        "needs_human_review": needs_human
    }
    
    recommendation = "AUTOMATIC_APPROVE" if not needs_human else "HUMAN_REVIEW"
    
    return {
        "messages": [AIMessage(content=f"✅ Análise IA concluída. Recomendação: {recommendation}")],
        "ai_analysis": ai_analysis,
        "confidence_score": confidence,
        "requires_human_review": needs_human,
        "status": ModerationStatus.NEEDS_REVIEW if needs_human else ModerationStatus.PENDING
    }

def human_review_node(state: ModerationState):
    """Nó de revisão humana"""
    
    print(f"👤 Revisão humana necessária para conteúdo {state['content_id']}")
    print(f"📊 Score de confiança da IA: {state['confidence_score']:.2f}")
    print(f"⚠️ Problemas detectados: {state['ai_analysis']['safety']['detected_issues']}")
    
    # Simula interface de revisão humana
    print("\n" + "="*50)
    print("INTERFACE DE REVISÃO HUMANA")
    print("="*50)
    print(f"Conteúdo: {state['content']}")
    print(f"Análise IA: {state['ai_analysis']}")
    print("="*50)
    
    # Simula decisão humana (em produção, seria uma interface real)
    human_decision = simulate_human_decision(state)
    
    return {
        "messages": [AIMessage(content=f"👤 Revisão humana: {human_decision['decision']}")],
        "human_feedback": human_decision,
        "status": ModerationStatus.APPROVED if human_decision["decision"] == "APPROVE" else ModerationStatus.REJECTED
    }

def simulate_human_decision(state: ModerationState):
    """Simula decisão humana baseada em regras"""
    
    # Simula lógica de decisão humana
    risk_score = state["ai_analysis"]["safety"]["risk_score"]
    violations = state["ai_analysis"]["policy"]["violations"]
    
    if risk_score > 0.7 or len(violations) > 2:
        decision = "REJECT"
        reason = "Conteúdo muito arriscado"
    elif risk_score > 0.4 or len(violations) > 0:
        decision = "APPROVE_WITH_WARNING"
        reason = "Aprovado com ressalvas"
    else:
        decision = "APPROVE"
        reason = "Conteúdo seguro"
    
    return {
        "decision": decision,
        "reason": reason,
        "reviewer_id": "human_moderator_001",
        "timestamp": "2024-01-01T10:00:00Z"
    }

def auto_approve_node(state: ModerationState):
    """Nó de aprovação automática"""
    
    print(f"✅ Aprovação automática para conteúdo {state['content_id']}")
    
    return {
        "messages": [AIMessage(content="✅ Conteúdo aprovado automaticamente pela IA")],
        "status": ModerationStatus.APPROVED,
        "human_feedback": {
            "decision": "AUTO_APPROVE",
            "reason": "Score de confiança alto, sem problemas detectados",
            "reviewer_id": "ai_system"
        }
    }

def finalize_moderation_node(state: ModerationState):
    """Nó final de finalização"""
    
    print(f"🏁 Finalizando moderação para conteúdo {state['content_id']}")
    print(f"📋 Status final: {state['status']}")
    
    if state["status"] == ModerationStatus.APPROVED:
        print("✅ Conteúdo aprovado e publicado")
    else:
        print("❌ Conteúdo rejeitado")
    
    return {
        "messages": [AIMessage(content=f"🏁 Moderação finalizada: {state['status']}")]
    }

def route_moderation(state: ModerationState):
    """Roteia o fluxo de moderação"""
    
    if state["requires_human_review"]:
        return "human_review"
    else:
        return "auto_approve"

def route_after_review(state: ModerationState):
    """Roteia após revisão humana"""
    return "finalize"

def create_moderation_graph():
    """Cria o grafo de moderação com HITL"""
    
    builder = StateGraph(ModerationState)
    
    # Adiciona nós
    builder.add_node("ai_analysis", ai_analysis_node)
    builder.add_node("human_review", human_review_node)
    builder.add_node("auto_approve", auto_approve_node)
    builder.add_node("finalize", finalize_moderation_node)
    
    # Adiciona arestas
    builder.add_edge(START, "ai_analysis")
    
    builder.add_conditional_edges(
        "ai_analysis",
        route_moderation,
        {
            "human_review": "human_review",
            "auto_approve": "auto_approve"
        }
    )
    
    builder.add_conditional_edges(
        "human_review",
        route_after_review,
        {
            "finalize": "finalize"
        }
    )
    
    builder.add_edge("auto_approve", "finalize")
    builder.add_edge("finalize", END)
    
    return builder.compile()

# Sistema de feedback para melhoria contínua
class FeedbackLearningSystem:
    """Sistema de aprendizado com feedback humano"""
    
    def __init__(self):
        self.feedback_history = []
        self.ai_performance = {"correct": 0, "incorrect": 0}
    
    def record_feedback(self, content_id: str, ai_decision: str, human_decision: str):
        """Registra feedback humano para melhoria"""
        
        feedback = {
            "content_id": content_id,
            "ai_decision": ai_decision,
            "human_decision": human_decision,
            "agreement": ai_decision == human_decision,
            "timestamp": "2024-01-01T10:00:00Z"
        }
        
        self.feedback_history.append(feedback)
        
        if feedback["agreement"]:
            self.ai_performance["correct"] += 1
        else:
            self.ai_performance["incorrect"] += 1
        
        print(f"📚 Feedback registrado: {'✅ Concordância' if feedback['agreement'] else '❌ Discordância'}")
    
    def get_ai_accuracy(self):
        """Calcula precisão atual da IA"""
        total = self.ai_performance["correct"] + self.ai_performance["incorrect"]
        if total == 0:
            return 0.0
        return self.ai_performance["correct"] / total
    
    def suggest_improvements(self):
        """Sugere melhorias baseadas no feedback"""
        accuracy = self.get_ai_accuracy()
        
        if accuracy < 0.8:
            return "⚠️ IA precisa de ajustes. Considere retreinar o modelo."
        elif accuracy < 0.9:
            return "📈 IA está bem, mas pode melhorar com mais dados."
        else:
            return "🎉 IA está performando excelentemente!"

# Demonstração do sistema HITL
def demonstrate_hitl_system():
    """Demonstra o sistema Human-in-the-Loop"""
    
    print("=== Sistema de Moderação com Human-in-the-Loop ===\n")
    
    graph = create_moderation_graph()
    feedback_system = FeedbackLearningSystem()
    
    # Casos de teste
    test_cases = [
        {
            "content_id": "CONTENT_001",
            "content": "Este é um conteúdo seguro e apropriado para todos os públicos."
        },
        {
            "content_id": "CONTENT_002", 
            "content": "Este conteúdo contém violência e ódio que não deveria ser publicado."
        },
        {
            "content_id": "CONTENT_003",
            "content": "Conteúdo com muitos pontos de exclamação!!!!! E links suspeitos http://spam.com"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n--- Teste {i}: {test_case['content_id']} ---")
        
        # Estado inicial
        initial_state = {
            "messages": [],
            "content": test_case["content"],
            "content_id": test_case["content_id"],
            "ai_analysis": {},
            "human_feedback": {},
            "status": ModerationStatus.PENDING,
            "confidence_score": 0.0,
            "requires_human_review": False
        }
        
        # Executa moderação
        result = graph.invoke(initial_state)
        
        # Simula feedback para aprendizado
        ai_decision = "APPROVE" if result["status"] == ModerationStatus.APPROVED else "REJECT"
        human_decision = "APPROVE" if "seguro" in test_case["content"] else "REJECT"
        
        feedback_system.record_feedback(
            test_case["content_id"],
            ai_decision,
            human_decision
        )
        
        print(f"📊 Precisão atual da IA: {feedback_system.get_ai_accuracy():.2%}")
        print(f"💡 {feedback_system.suggest_improvements()}")

# Interface de revisão humana (conceitual)
class HumanReviewInterface:
    """Interface para revisão humana"""
    
    def __init__(self):
        self.pending_reviews = []
        self.reviewers = []
    
    def add_reviewer(self, reviewer_id: str, expertise: list):
        """Adiciona revisor humano"""
        self.reviewers.append({
            "id": reviewer_id,
            "expertise": expertise,
            "active": True
        })
    
    def assign_review(self, content_id: str, content: str, ai_analysis: dict):
        """Atribui revisão a um revisor"""
        review = {
            "content_id": content_id,
            "content": content,
            "ai_analysis": ai_analysis,
            "assigned_to": None,
            "status": "pending"
        }
        
        self.pending_reviews.append(review)
        return review
    
    def get_review_interface(self, review_id: str):
        """Retorna interface de revisão"""
        return {
            "review_id": review_id,
            "actions": ["APPROVE", "REJECT", "REQUEST_CHANGES"],
            "fields": ["decision", "reason", "confidence"]
        }

if __name__ == "__main__":
    demonstrate_hitl_system()
    
    print("\n=== Benefícios do Human-in-the-Loop ===")
    print("✅ Qualidade superior através de validação humana")
    print("✅ Segurança em decisões críticas")
    print("✅ Aprendizado contínuo do sistema")
    print("✅ Conformidade com regulamentações")
    print("✅ Maior confiança dos usuários")
    print("✅ Redução de falsos positivos/negativos")
```

## Características do Human-in-the-Loop

### 1. **Intervenção Inteligente**
- Humanos são chamados apenas quando necessário
- Critérios claros para quando requer revisão humana

### 2. **Feedback Estruturado**
- Interface padronizada para feedback humano
- Coleta sistemática de dados para melhoria

### 3. **Aprendizado Contínuo**
- Sistema aprende com decisões humanas
- Melhora precisão ao longo do tempo

### 4. **Auditoria Completa**
- Rastreamento de todas as intervenções humanas
- Histórico para conformidade e debugging

## Casos de Uso Práticos

1. **Moderação de Conteúdo**: Validação de posts, comentários, uploads
2. **Decisões Financeiras**: Aprovação de empréstimos, transações suspeitas
3. **Diagnóstico Médico**: Validação de diagnósticos por IA
4. **Revisão Legal**: Análise de contratos e documentos jurídicos
5. **Controle de Qualidade**: Inspeção de produtos e processos

## Implementação de Interface Humana

### 1. **Dashboard de Revisão**
```python
# Exemplo conceitual de dashboard
class ReviewDashboard:
    def show_pending_reviews(self):
        return self.pending_reviews
    
    def submit_review(self, review_id, decision, reason):
        # Processa decisão humana
        pass
```

### 2. **Sistema de Notificações**
```python
# Exemplo conceitual de notificações
class NotificationSystem:
    def notify_reviewer(self, reviewer_id, review_data):
        # Envia notificação para revisor
        pass
```

### 3. **Métricas de Performance**
```python
# Exemplo conceitual de métricas
class PerformanceMetrics:
    def calculate_human_ai_agreement(self):
        # Calcula concordância entre IA e humanos
        pass
```

## Benefícios Operacionais

- **Qualidade Garantida**: Humanos validam resultados críticos
- **Redução de Riscos**: Intervenção em decisões sensíveis
- **Melhoria Contínua**: Feedback humano melhora a IA
- **Conformidade**: Atende requisitos regulatórios
- **Transparência**: Processo auditável e explicável
- **Confiança**: Usuários confiam mais no sistema

O Human-in-the-Loop transforma sistemas de IA de "caixas pretas" em sistemas colaborativos onde humanos e máquinas trabalham juntos para alcançar resultados superiores.
