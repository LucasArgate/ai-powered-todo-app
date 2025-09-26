#!/usr/bin/env python3
"""
Script de execução rápida do Task Generator Agent
Execute este arquivo para ver o agente em ação!
"""

import sys
import json
from task_generator_agent import TaskGeneratorAgent

def main():
    """Execução principal com exemplo interativo"""
    
    print("🤖 TASK GENERATOR AGENT - DEMONSTRAÇÃO RÁPIDA")
    print("=" * 60)
    print("Baseado na estratégia definida nos documentos do projeto")
    print("Implementa: Validation → Processing → Structuring → LangSmith")
    print("=" * 60)
    
    # Inicializa o agente
    try:
        agent = TaskGeneratorAgent()
        print("✅ Agente inicializado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao inicializar agente: {e}")
        print("💡 Verifique se as dependências estão instaladas:")
        print("   pnpm install -r requirements.txt")
        return
    
    # Goal de exemplo (viagem ao Japão)
    goal_exemplo = "Planejar uma viagem para o Japão de 2 semanas"
    
    print(f"\n🎯 Testando com goal: '{goal_exemplo}'")
    print("\n🚀 Executando pipeline completo do agente...")
    
    try:
        # Executa o agente
        resultado = agent.generate_tasks(goal_exemplo)
        
        if "error" in resultado:
            print(f"❌ Erro durante execução: {resultado['error']}")
            return
        
        # Exibe resultados principais
        print(f"\n📊 RESULTADOS DA EXECUÇÃO:")
        print("─" * 40)
        
        metadata = resultado.get("metadata", {})
        
        print(f"✅ Status: Execução bem-sucedida")
        print(f"📝 Tarefas geradas: {metadata.get('total_tasks', 0)}")
        print(f"⏱️ Tempo estimado: {metadata.get('estimated_completion', 'N/A')}")
        print(f"🧠 Intenção detectada: {metadata.get('intention', 'N/A')}")
        print(f"🆔 ID da sessão: {resultado.get('id', 'N/A')}")
        
        # Mostra as primeiras 5 tarefas
        print(f"\n📋 PRIMEIRAS 5 TAREFAS GERADAS:")
        print("─" * 40)
        
        tasks = resultado.get("tasks", [])[:5]
        for i, task in enumerate(tasks, 1):
            priority_emoji = {"alta": "🔴", "média": "🟡", "baixa": "🟢"}
            emoji = priority_emoji.get(task.get("priority", "média"), "⚪")
            
            print(f"{emoji} {i}. {task.get('title', 'Título não disponível')}")
            print(f"   📅 {task.get('estimated_time', 'N/A')} | 🏷️ {task.get('category', 'N/A')}")
        
        if len(resultado.get("tasks", [])) > 5:
            remaining = len(resultado.get("tasks", [])) - 5
            print(f"   ... e mais {remaining} tarefas")
        
        # Salva resultado em arquivo para análise
        output_file = "resultado_exemplo.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Resultado completo salvo em: {output_file}")
        
        # Estatísticas técnicas
        print(f"\n🔧 ESTATÍSTICAS TÉCNICAS:")
        print("─" * 40)
        print(f"📦 Framework: LangGraph + LangChain")
        print(f"📊 Observabilidade: LangSmith integrado")
        print(f"🏗️ Arquitetura: StateGraph com 3 nós")
        print(f"⚙️ Pipeline: Validation → Processing → Structuring")
        print(f"📄 Output: JSON estruturado para preview")
        
    except Exception as e:
        print(f"❌ Erro durante execução: {e}")
        print(f"💡 Verifique a configuração do ambiente")
        return
    
    print(f"\n🎉 DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("─" * 40)
    print("✅ Todas as funcionalidades implementadas:")
    print("   1. ✅ Validação de intenção com porcentagem")
    print("   2. ✅ Processamento de passos estruturados")
    print("   3. ✅ Conversão para JSON padronizado")
    print("   4. ✅ Observabilidade LangSmith")
    print("   5. ✅ Exemplo prático funcionando")
    
    print(f"\n🚀 PRÓXIMOS PASSOS:")
    print("─" * 40)
    print("1. 📱 Integrar JSON gerado com preview existente")
    print("2. 🎨 Criar interface web para entrada de goals")
    print("3. 📅 Adicionar sistema de agendamento")
    print("4. 💰 Implementar controle de orçamento")
    print("5. 🔔 Configurar notificações automáticas")

if __name__ == "__main__":
    main()
