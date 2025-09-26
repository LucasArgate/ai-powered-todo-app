# Task Generator Agent 🤖

Um agentic inteligente para geração de tarefas baseado em goals, implementado com LangGraph e seguindo os princípios estratégicos definidos na documentação do projeto.

## 🎯 Funcionalidades Principais

### Estratégia Seguida 🧠
Este agente implementa uma **estratégia robusta baseada em 7 pilares fundamentais** do LangGraph:

- **💾 Persistência**: Estado mantido entre execuções com checkpointing automático
- **🔄 Execução Durável**: Resistência a falhas e recuperação automática de estado  
- **📡 Streaming**: Feedback em tempo real durante processamento
- **👤 Human-in-the-Loop**: Pontos de validação humana quando necessário
- **🧠 Memória**: Contexto acumulado entre interações e aprendizado progressivo
- **🔗 Subgrafos**: Arquitetura modular e reutilizável para componentes complexos
- **⏰ Time Travel**: Navegação temporal para debugging e auditoria completa

📖 **[Ver estratégia completa](./docs/strategy.md)** - Documentação detalhada dos princípios estratégicos

### 1. Validação de Intenção ✅
- Analisa a viabilidade do goal fornecido
- Calcula porcentagem de viabilidade baseada em fatores como clareza, especificidade e alcançabilidade
- Detecta automaticamente a intenção provável (planejamento de viagem, desenvolvimento de projeto, etc.)

### 2. Processamento de Passos ⚙️
- Gera passos estruturados baseados na intenção detectada
- Personaliza tarefas de acordo com o contexto específico
- Estima tempo e define prioridades para cada passo

### 3. Conversão para JSON Estruturado 📄
- Converte os passos em formato JSON padronizado
- Inclui metadados completos (IDs, timestamps, dependências)
- Pronto para integração com preview existente

### 4. Observabilidade LangSmith 📊
- Integração completa com LangSmith para monitoramento
- Logs estruturados de todas as operações
- Métricas de performance e confiabilidade

## 🚀 Como Usar

### Instalação

```bash
# Instalar dependências
pnpm install -r requirements.txt

# Configurar variáveis de ambiente para LangSmith (opcional)
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=task-generator-agent
export LANGSMITH_API_KEY=your-api-key
```

### Uso Básico

```python
from task_generator_agent import TaskGeneratorAgent

# Inicializar o agente
agent = TaskGeneratorAgent()

# Gerar tarefas para um goal
resultado = agent.generate_tasks("Planejar uma viagem para o Japão")

# O resultado é um JSON estruturado pronto para uso
print(resultado)
```

### Exemplo Prático

```python
# Executar exemplo completo de viagem ao Japão
python exemplo_viagem_japao.py
```

## 📊 Exemplo de Saída

Para o goal "Planejar uma viagem para o Japão", o agente gera:

```json
{
  "id": "uuid-generated",
  "goal": "Planejar uma viagem para o Japão",
  "created_at": "2024-01-01T10:00:00",
  "status": "ready_for_execution",
  "metadata": {
    "total_tasks": 10,
    "estimated_completion": "20 days",
    "intention": "planejamento_viagem"
  },
  "tasks": [
    {
      "id": "task-uuid-1",
      "title": "Definir datas da viagem",
      "description": "Passo 1 para alcançar: Planejar uma viagem para o Japão",
      "priority": "alta",
      "category": "Planejamento Viagem",
      "estimated_time": "1 day",
      "status": "pending",
      "dependencies": [],
      "tags": ["planejamento-viagem", "alta"]
    }
    // ... mais tarefas
  ]
}
```

## 🧠 Arquitetura do Agente

O agente implementa uma **arquitetura robusta baseada nos 7 pilares estratégicos** do LangGraph:

### 1. **Persistence** 💾
- Estado mantido entre execuções com checkpointing automático
- Suporte a múltiplas sessões simultâneas
- Recuperação exata do ponto de interrupção

### 2. **Durable Execution** 🔄
- Resistência a falhas e reinicializações
- Recuperação automática de estado sem reprocessamento
- Workflows que podem levar horas ou dias para completar

### 3. **Streaming** 📡
- Feedback em tempo real durante processamento
- Transmissão de dados conforme são gerados
- Experiência do usuário mais interativa e responsiva

### 4. **Human-in-the-Loop** 👤
- Pontos de validação humana quando necessário
- Sistema de feedback para melhoria contínua
- Intervenção em decisões críticas ou sensíveis

### 5. **Memory** 🧠
- Contexto acumulado entre interações
- Aprendizado baseado em histórico
- Personalização progressiva do sistema

### 6. **Subgrafos** 🔗
- Arquitetura modular e reutilizável
- Componentes independentes e testáveis
- Composição flexível de workflows complexos

### 7. **Time Travel** ⏰
- Navegação temporal para debugging avançado
- Auditoria completa de todas as ações
- Capacidade de "desfazer" e reexecutar

## 🛠️ Estrutura do Código

```text
📁 Projeto
├── 📄 task_generator_agent.py    # Agente principal
├── 📄 exemplo_viagem_japao.py    # Exemplo prático
├── 📄 requirements.txt           # Dependências
├── 📄 README.md                  # Documentação
└── 📁 docs/                      # Estratégias (base de conhecimento)
    ├── 📄 strategy.md
    ├── 📄 goal.md
    └── 📁 strategy/
        ├── 📄 persistence.md
        ├── 📄 memory.md
        └── ... outros arquivos
```

## 🎯 Casos de Uso

### 1. Planejamento de Viagens
- **Goal**: "Planejar viagem para o Japão"
- **Resultado**: 10 tarefas estruturadas com roteiro completo

### 2. Desenvolvimento de Projetos
- **Goal**: "Criar aplicativo de tarefas"
- **Resultado**: Passos de desenvolvimento desde planejamento até deploy

### 3. Organização de Eventos
- **Goal**: "Organizar festa de casamento"
- **Resultado**: Cronograma detalhado com todas as atividades

### 4. Estudos e Capacitação
- **Goal**: "Estudar para concurso público"
- **Resultado**: Plano de estudos estruturado por temas

## 📈 Métricas e Observabilidade

O agente coleta automaticamente:

- ✅ **Score de Viabilidade**: Porcentagem de viabilidade do goal
- ⏱️ **Tempo de Processamento**: Duração total da geração
- 📊 **Número de Tarefas**: Quantidade de tarefas geradas
- 🎯 **Tipo de Intenção**: Categoria detectada do goal
- 📅 **Tempo Estimado**: Duração prevista para conclusão

## 🔧 Configuração Avançada

### LangSmith (Observabilidade)

```python
# Configurar via variáveis de ambiente
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=task-generator-agent
export LANGSMITH_API_KEY=your-api-key
```

### Personalização de Templates

O agente suporta personalização de templates de tarefas para diferentes tipos de intenção:

```python
# Em task_generator_agent.py, seção step_templates
step_templates = {
    "planejamento_viagem": [...],
    "desenvolvimento_projeto": [...],
    "seu_template_customizado": [...]
}
```

## 🤝 Contribuindo

O projeto segue os princípios de Clean Code e implementa a **estratégia robusta dos 7 pilares**:

1. 📚 **Base de Conhecimento**: Use a pasta `docs/strategy/` como referência
2. 🏗️ **Arquitetura**: Implemente os 7 pilares estratégicos (Persistência, Execução Durável, Streaming, HITL, Memória, Subgrafos, Time Travel)
3. 🧹 **Clean Code**: Aplique conceitos de código limpo e modular
4. 🌍 **Internacionalização**: Prompts em inglês, respostas em português para usuários
5. 🔗 **Modularidade**: Use subgrafos para componentes reutilizáveis
6. 📊 **Observabilidade**: Integre LangSmith para monitoramento completo

## 📝 Próximos Passos

- [ ] Integração com sistema de preview existente
- [ ] Interface web para entrada de goals
- [ ] Sistema de templates personalizáveis
- [ ] Integração com calendário para agendamento
- [ ] Sistema de orçamento por tarefa
- [ ] Notificações e lembretes

## 📞 Suporte

Para dúvidas ou sugestões sobre o Task Generator Agent, consulte:

1. 📖 **[Estratégia Completa](./docs/strategy.md)** - Os 7 pilares fundamentais
2. 📚 **[Documentação Detalhada](./docs/strategy/)** - Implementação de cada pilar
3. 💡 **Exemplos Práticos** em `exemplo_viagem_japao.py`
4. 🔧 **Código Fonte** comentado em `task_generator_agent.py`
5. 🎯 **[Goal Documentation](./docs/goal.md)** - Objetivos do projeto
