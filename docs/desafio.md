### **Descrição do Teste Técnico**

Este desafio prático visa avaliar suas habilidades como Desenvolvedor Full-Stack Sênior na construção de uma aplicação moderna e funcional. O objetivo é desenvolver uma "Smart To-Do List", uma lista de tarefas que vai além do CRUD tradicional. A aplicação deverá integrar uma funcionalidade de Inteligência Artificial que, a partir de um objetivo de alto nível descrito pelo usuário (como "planejar uma viagem"), gera automaticamente uma lista de subtarefas acionáveis. Este projeto testará sua capacidade de criar uma aplicação completa, desde a API robusta no backend até uma interface reativa no frontend, e sua criatividade na integração com serviços de IA.

### **Stacks Tecnológicas Requeridas**

A seguir, detalhamos as responsabilidades e os requisitos para cada parte da stack tecnológica obrigatória.

---

#### **Backend: NestJS com TypeScript**

O backend será o cérebro da aplicação, responsável pela lógica de negócios, persistência de dados e, crucialmente, pela comunicação com a API de Inteligência Artificial. A arquitetura da API (endpoints, métodos, etc.) fica a seu critério.

* **Lógica de Negócios:** Implementar toda a funcionalidade para gerenciar o ciclo de vida de tarefas:  
  * Criação  
  * Leitura ou listagem  
  * Atualização (ex: marcar como concluída)  
  * Exclusão  
* **Persistência de Dados:** Utilizar **SQLite** como banco de dados para garantir a simplicidade e a portabilidade do projeto. O modelo da tarefa deve incluir, no mínimo, `title`, `isCompleted` e `createdAt`.  
* **Integração com IA:**  
  * Desenvolver um endpoint na API que receba um prompt do usuário.  
  * Implementar a lógica para se comunicar com uma API de Inferência de um LLM (ex: Hugging Face, OpenRouter, ou qualquer provedor que ofereça inferências gratuitas), enviando o prompt do usuário de forma estruturada  
    Deixe um campo disponivel para inserir a API Key do Hugging Face ou OpenRouter, não é necessário compartilhar sua key.  
  * Processar a resposta da IA, extrair as tarefas geradas e persisti-las no banco de dados.

---

#### **Frontend: Next.js com TypeScript**

O frontend será a interface com a qual o usuário interage. Deve ser reativa e intuitiva, consumindo a API criada.

* **Gerenciamento de Estado:** Exibir e gerenciar a lista de tarefas de forma eficiente, refletindo em tempo real as criações, atualizações e exclusões.  
* **Interatividade com o Usuário:**  
  * Permitir a criação de tarefas através de um formulário simples.  
  * Permitir que o usuário marque/desmarque tarefas como concluídas.  
  * Implementar a funcionalidade para deletar tarefas.  
* **Funcionalidade de IA:**  
  * Criar um componente de interface claro com um campo de texto e um botão para que o usuário possa descrever seu objetivo, criar também um campo para adicionar a API Key do provedor de IA.  
  * Ao acionar o botão, fazer a chamada para o endpoint correspondente no backend.  
  * Atualizar a lista de tarefas na tela com as novas tarefas retornadas pela API, sem a necessidade de recarregar a página.

O projeto poderá ser entregue como repositório público do github ou arquivo zip. 
