# Add and Manage Memory

[← Voltar para Strategy](../strategy.md)

O gerenciamento de memória no LangGraph permite que agentes mantenham contexto entre interações, lembrem de informações importantes e construam conhecimento ao longo do tempo. Isso é fundamental para criar assistentes inteligentes que evoluem e melhoram com o uso.

## Por que Gerenciamento de Memória é Importante?

- **Contexto Contínuo**: Mantém conversas coerentes ao longo do tempo
- **Aprendizado Personalizado**: Adapta-se às preferências do usuário
- **Eficiência**: Não precisa repetir informações já conhecidas
- **Experiência Personalizada**: Oferece respostas mais relevantes
- **Conhecimento Acumulado**: Constrói base de conhecimento progressivamente

## Exemplo Prático: Assistente Pessoal com Memória Avançada

```python
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
from typing_extensions import TypedDict, Annotated
import operator
import json
from datetime import datetime, timedelta
from enum import Enum

# Tipos de memória
class MemoryType(str, Enum):
    CONVERSATION = "conversation"
    PREFERENCE = "preference"
    FACT = "fact"
    TASK = "task"
    RELATIONSHIP = "relationship"

# Estado do assistente com memória
class AssistantState(TypedDict):
    messages: Annotated[list, operator.add]
    user_id: str
    current_context: dict
    memory_bank: dict
    active_memories: list
    memory_updates: list

# Sistema de memória avançado
class AdvancedMemorySystem:
    """Sistema de memória com diferentes tipos e persistência"""
    
    def __init__(self):
        self.memories = {
            "conversation": {},  # Histórico de conversas
            "preference": {},    # Preferências do usuário
            "fact": {},         # Fatos sobre o usuário
            "task": {},         # Tarefas e lembretes
            "relationship": {}  # Relacionamentos e conexões
        }
        self.memory_index = {}  # Índice para busca rápida
    
    def store_memory(self, user_id: str, memory_type: MemoryType, content: dict):
        """Armazena uma nova memória"""
        
        if user_id not in self.memories[memory_type.value]:
            self.memories[memory_type.value][user_id] = []
        
        memory_entry = {
            "id": f"{memory_type.value}_{len(self.memories[memory_type.value][user_id])}",
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "access_count": 0,
            "importance": content.get("importance", 0.5)
        }
        
        self.memories[memory_type.value][user_id].append(memory_entry)
        
        # Atualiza índice para busca
        self._update_index(user_id, memory_entry)
        
        return memory_entry["id"]
    
    def retrieve_memories(self, user_id: str, memory_type: MemoryType = None, query: str = None):
        """Recupera memórias relevantes"""
        
        relevant_memories = []
        
        if memory_type:
            # Busca em tipo específico
            user_memories = self.memories[memory_type.value].get(user_id, [])
            relevant_memories.extend(user_memories)
        else:
            # Busca em todos os tipos
            for mem_type in self.memories:
                user_memories = self.memories[mem_type].get(user_id, [])
                relevant_memories.extend(user_memories)
        
        # Filtra por query se fornecida
        if query:
            relevant_memories = [
                mem for mem in relevant_memories
                if query.lower() in str(mem["content"]).lower()
            ]
        
        # Ordena por importância e recência
        relevant_memories.sort(
            key=lambda x: (x["importance"], x["timestamp"]),
            reverse=True
        )
        
        return relevant_memories[:10]  # Retorna top 10
    
    def update_memory(self, user_id: str, memory_id: str, updates: dict):
        """Atualiza uma memória existente"""
        
        for mem_type in self.memories:
            for memory in self.memories[mem_type].get(user_id, []):
                if memory["id"] == memory_id:
                    memory["content"].update(updates)
                    memory["timestamp"] = datetime.now().isoformat()
                    return True
        
        return False
    
    def _update_index(self, user_id: str, memory_entry: dict):
        """Atualiza índice de busca"""
        
        if user_id not in self.memory_index:
            self.memory_index[user_id] = {}
        
        # Indexa palavras-chave do conteúdo
        content_str = str(memory_entry["content"]).lower()
        keywords = content_str.split()
        
        for keyword in keywords:
            if keyword not in self.memory_index[user_id]:
                self.memory_index[user_id][keyword] = []
            self.memory_index[user_id][keyword].append(memory_entry["id"])

# Ferramentas de memória
@tool
def remember_preference(user_id: str, preference_type: str, value: str) -> str:
    """Armazena preferência do usuário"""
    
    memory_system = AdvancedMemorySystem()
    
    preference_data = {
        "type": preference_type,
        "value": value,
        "importance": 0.8
    }
    
    memory_id = memory_system.store_memory(
        user_id, 
        MemoryType.PREFERENCE, 
        preference_data
    )
    
    return f"Preferência '{preference_type}: {value}' armazenada (ID: {memory_id})"

@tool
def remember_fact(user_id: str, fact: str, category: str = "general") -> str:
    """Armazena fato sobre o usuário"""
    
    memory_system = AdvancedMemorySystem()
    
    fact_data = {
        "fact": fact,
        "category": category,
        "importance": 0.7
    }
    
    memory_id = memory_system.store_memory(
        user_id,
        MemoryType.FACT,
        fact_data
    )
    
    return f"Fato '{fact}' armazenado na categoria '{category}' (ID: {memory_id})"

@tool
def create_reminder(user_id: str, task: str, due_date: str, priority: str = "medium") -> str:
    """Cria lembrete para o usuário"""
    
    memory_system = AdvancedMemorySystem()
    
    task_data = {
        "task": task,
        "due_date": due_date,
        "priority": priority,
        "status": "pending",
        "importance": 0.9 if priority == "high" else 0.6
    }
    
    memory_id = memory_system.store_memory(
        user_id,
        MemoryType.TASK,
        task_data
    )
    
    return f"Lembrete criado: '{task}' para {due_date} (ID: {memory_id})"

@tool
def recall_memories(user_id: str, query: str = None, memory_type: str = None) -> str:
    """Recupera memórias relevantes"""
    
    memory_system = AdvancedMemorySystem()
    
    mem_type = MemoryType(memory_type) if memory_type else None
    memories = memory_system.retrieve_memories(user_id, mem_type, query)
    
    if not memories:
        return "Nenhuma memória encontrada."
    
    result = f"Encontradas {len(memories)} memórias relevantes:\n"
    for mem in memories:
        result += f"- {mem['content']} (Importância: {mem['importance']})\n"
    
    return result

# Nós do assistente
def memory_analysis_node(state: AssistantState):
    """Analisa contexto atual e recupera memórias relevantes"""
    
    print(f"🧠 Analisando memórias para usuário {state['user_id']}...")
    
    # Simula análise do contexto atual
    current_message = state["messages"][-1].content if state["messages"] else ""
    
    # Recupera memórias relevantes
    memory_system = AdvancedMemorySystem()
    relevant_memories = memory_system.retrieve_memories(
        state["user_id"], 
        query=current_message
    )
    
    context_analysis = {
        "current_message": current_message,
        "relevant_memories": len(relevant_memories),
        "memory_types_found": list(set([mem["id"].split("_")[0] for mem in relevant_memories])),
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return {
        "messages": [AIMessage(content=f"✅ Análise de memória concluída. {len(relevant_memories)} memórias relevantes encontradas.")],
        "current_context": context_analysis,
        "active_memories": relevant_memories
    }

def personalized_response_node(state: AssistantState):
    """Gera resposta personalizada baseada em memórias"""
    
    print(f"💬 Gerando resposta personalizada para {state['user_id']}...")
    
    # Simula geração de resposta personalizada
    active_memories = state.get("active_memories", [])
    
    if active_memories:
        # Usa memórias para personalizar resposta
        preferences = [mem for mem in active_memories if "preference" in mem["id"]]
        facts = [mem for mem in active_memories if "fact" in mem["id"]]
        
        response_parts = ["Baseado no que lembro sobre você:"]
        
        if preferences:
            response_parts.append(f"Suas preferências: {len(preferences)} encontradas")
        
        if facts:
            response_parts.append(f"Fatos sobre você: {len(facts)} relevantes")
        
        personalized_response = " ".join(response_parts)
    else:
        personalized_response = "Não tenho memórias específicas sobre você ainda, mas posso ajudar!"
    
    return {
        "messages": [AIMessage(content=personalized_response)]
    }

def memory_update_node(state: AssistantState):
    """Atualiza memórias baseado na interação atual"""
    
    print(f"🔄 Atualizando memórias para {state['user_id']}...")
    
    # Simula atualização de memórias
    current_message = state["messages"][-1].content if state["messages"] else ""
    
    updates = []
    
    # Detecta novos fatos ou preferências na mensagem
    if "meu nome é" in current_message.lower():
        updates.append({
            "type": "fact",
            "content": {"fact": "Nome do usuário", "importance": 0.9}
        })
    
    if "eu gosto de" in current_message.lower():
        updates.append({
            "type": "preference", 
            "content": {"type": "interesse", "importance": 0.7}
        })
    
    if "lembre-me de" in current_message.lower():
        updates.append({
            "type": "task",
            "content": {"task": "Lembrete do usuário", "importance": 0.8}
        })
    
    return {
        "messages": [AIMessage(content=f"✅ {len(updates)} atualizações de memória processadas")],
        "memory_updates": updates
    }

def route_memory_flow(state: AssistantState):
    """Roteia fluxo baseado no tipo de interação"""
    
    current_message = state["messages"][-1].content.lower() if state["messages"] else ""
    
    if "lembre" in current_message or "memória" in current_message:
        return "memory_update"
    else:
        return "personalized_response"

def create_memory_assistant_graph():
    """Cria grafo do assistente com memória"""
    
    builder = StateGraph(AssistantState)
    
    # Adiciona nós
    builder.add_node("memory_analysis", memory_analysis_node)
    builder.add_node("personalized_response", personalized_response_node)
    builder.add_node("memory_update", memory_update_node)
    
    # Adiciona arestas
    builder.add_edge(START, "memory_analysis")
    builder.add_conditional_edges(
        "memory_analysis",
        route_memory_flow,
        {
            "personalized_response": "personalized_response",
            "memory_update": "memory_update"
        }
    )
    builder.add_edge("personalized_response", END)
    builder.add_edge("memory_update", END)
    
    return builder.compile()

# Demonstração do sistema de memória
def demonstrate_memory_system():
    """Demonstra capacidades do sistema de memória"""
    
    print("=== Assistente Pessoal com Memória Avançada ===\n")
    
    graph = create_memory_assistant_graph()
    memory_system = AdvancedMemorySystem()
    
    # Simula interações com diferentes usuários
    users = ["user_001", "user_002"]
    
    for user_id in users:
        print(f"\n--- Interações com {user_id} ---")
        
        # Interação 1: Primeira conversa
        state1 = {
            "messages": [HumanMessage(content="Olá! Meu nome é João e eu gosto de programação.")],
            "user_id": user_id,
            "current_context": {},
            "memory_bank": {},
            "active_memories": [],
            "memory_updates": []
        }
        
        result1 = graph.invoke(state1)
        print(f"Resposta: {result1['messages'][-1].content}")
        
        # Armazena memórias manualmente (simulação)
        memory_system.store_memory(
            user_id,
            MemoryType.FACT,
            {"fact": "Nome é João", "importance": 0.9}
        )
        
        memory_system.store_memory(
            user_id,
            MemoryType.PREFERENCE,
            {"type": "interesse", "value": "programação", "importance": 0.8}
        )
        
        # Interação 2: Conversa posterior
        state2 = {
            "messages": [HumanMessage(content="Qual é minha linguagem de programação favorita?")],
            "user_id": user_id,
            "current_context": {},
            "memory_bank": {},
            "active_memories": [],
            "memory_updates": []
        }
        
        result2 = graph.invoke(state2)
        print(f"Resposta: {result2['messages'][-1].content}")
        
        # Mostra memórias armazenadas
        memories = memory_system.retrieve_memories(user_id)
        print(f"Memórias armazenadas: {len(memories)}")

# Sistema de Limpeza de Memória
class MemoryCleanupSystem:
    """Sistema para limpeza e otimização de memória"""
    
    def __init__(self):
        self.cleanup_rules = {
            "max_age_days": 365,  # Remove memórias muito antigas
            "min_importance": 0.3,  # Remove memórias pouco importantes
            "max_memories_per_user": 1000  # Limite de memórias por usuário
        }
    
    def cleanup_old_memories(self, user_id: str):
        """Remove memórias antigas"""
        
        memory_system = AdvancedMemorySystem()
        cutoff_date = datetime.now() - timedelta(days=self.cleanup_rules["max_age_days"])
        
        removed_count = 0
        for mem_type in memory_system.memories:
            user_memories = memory_system.memories[mem_type].get(user_id, [])
            
            for memory in user_memories[:]:  # Cópia para iterar
                memory_date = datetime.fromisoformat(memory["timestamp"])
                if memory_date < cutoff_date:
                    user_memories.remove(memory)
                    removed_count += 1
        
        return removed_count
    
    def optimize_memory_importance(self, user_id: str):
        """Otimiza importância das memórias baseado no uso"""
        
        memory_system = AdvancedMemorySystem()
        
        for mem_type in memory_system.memories:
            user_memories = memory_system.memories[mem_type].get(user_id, [])
            
            for memory in user_memories:
                # Aumenta importância baseado no acesso
                access_factor = min(memory["access_count"] * 0.1, 0.3)
                memory["importance"] = min(memory["importance"] + access_factor, 1.0)

if __name__ == "__main__":
    demonstrate_memory_system()
    
    print("\n=== Benefícios do Gerenciamento de Memória ===")
    print("✅ Contexto contínuo entre interações")
    print("✅ Personalização baseada em histórico")
    print("✅ Aprendizado progressivo do usuário")
    print("✅ Eficiência através de conhecimento acumulado")
    print("✅ Experiência mais natural e humana")
    print("✅ Capacidade de lembrar preferências e fatos")
    print("✅ Sistema de lembretes e tarefas")
```

## Características do Gerenciamento de Memória

### 1. **Tipos de Memória**
- **Conversacional**: Histórico de diálogos
- **Preferências**: Gostos e configurações do usuário
- **Fatos**: Informações sobre o usuário
- **Tarefas**: Lembretes e compromissos
- **Relacionamentos**: Conexões e contatos

### 2. **Persistência Inteligente**
- Armazenamento estruturado por tipo
- Índices para busca rápida
- Sistema de importância e relevância

### 3. **Recuperação Contextual**
- Busca baseada em contexto atual
- Ranking por relevância e importância
- Filtros por tipo de memória

### 4. **Otimização Automática**
- Limpeza de memórias antigas
- Ajuste de importância baseado no uso
- Limites para evitar sobrecarga

## Casos de Uso Práticos

1. **Assistentes Pessoais**: Lembrar preferências e contexto
2. **Chatbots de Suporte**: Histórico de problemas e soluções
3. **Sistemas de Recomendação**: Preferências acumuladas
4. **Assistentes de Produtividade**: Tarefas e lembretes
5. **Tutores Inteligentes**: Progresso e dificuldades do aluno

## Implementação Técnica

### 1. **Armazenamento Estruturado**
```python
# Diferentes tipos de memória
memories = {
    "conversation": {},
    "preference": {},
    "fact": {},
    "task": {}
}
```

### 2. **Sistema de Índices**
```python
# Índice para busca rápida
memory_index = {
    "user_id": {
        "keyword": ["memory_id1", "memory_id2"]
    }
}
```

### 3. **Recuperação Inteligente**
```python
# Busca contextual
relevant_memories = retrieve_memories(
    user_id, 
    query=current_context,
    memory_type=MemoryType.PREFERENCE
)
```

## Benefícios Operacionais

- **Experiência Personalizada**: Respostas adaptadas ao usuário
- **Eficiência**: Não repete informações conhecidas
- **Aprendizado Contínuo**: Melhora com cada interação
- **Contexto Rico**: Conversas mais naturais e coerentes
- **Produtividade**: Lembretes e gestão de tarefas
- **Satisfação**: Usuários sentem que são "lembrados"

O gerenciamento de memória transforma agentes de IA de sistemas "sem memória" em assistentes verdadeiramente inteligentes que evoluem e se adaptam às necessidades individuais de cada usuário.
