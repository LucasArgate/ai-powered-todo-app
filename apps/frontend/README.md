# Smart Todo List - Frontend

Uma aplicação frontend moderna construída com **Next.js 14** e **Atomic Design**, oferecendo uma interface reativa e intuitiva para o gerenciamento de tarefas inteligentes com integração de IA.

## 🎯 O que esta aplicação oferece?

Uma interface moderna e responsiva que permite aos usuários:

- 🎯 **Criar listas de tarefas** manualmente ou com ajuda da IA
- ✅ **Gerenciar tarefas** com operações completas (CRUD)
- 🤖 **Gerar tarefas automaticamente** usando IA (Hugging Face/OpenRouter)
- 📱 **Experiência responsiva** em todos os dispositivos
- 🔄 **Atualizações em tempo real** sem recarregar a página

## 🚀 Tecnologias Utilizadas

### Por que essas tecnologias?

**Frontend (Next.js + TypeScript + Atomic Design)**
- ✅ **Next.js 14**: Framework React moderno com App Router para performance otimizada
- ✅ **TypeScript**: Tipagem estática completa para código mais seguro e manutenível
- ✅ **Atomic Design**: Arquitetura de componentes escalável e reutilizável
- ✅ **Tailwind CSS**: Sistema de design consistente e responsivo
- ✅ **Axios**: Cliente HTTP robusto para comunicação com a API
- ✅ **Custom Hooks**: Gerenciamento de estado centralizado e eficiente

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página principal
├── components/            # Componentes Atomic Design
│   ├── atoms/             # Elementos básicos
│   │   ├── Button/        # Botão reutilizável
│   │   ├── Input/         # Campo de entrada
│   │   ├── Checkbox/      # Checkbox com label
│   │   ├── Card/          # Container consistente
│   │   └── LoadingSpinner/ # Indicador de carregamento
│   ├── molecules/         # Combinações simples
│   │   ├── TaskItem/      # Item de tarefa individual
│   │   ├── TaskForm/      # Formulário de tarefas
│   │   ├── AIForm/        # Formulário de IA
│   │   └── TaskListHeader/ # Cabeçalho da lista
│   ├── organisms/         # Combinações complexas
│   │   ├── TaskList/      # Lista completa de tarefas
│   │   ├── TaskListSelector/ # Seletor de listas
│   │   └── AISettings/    # Configurações de IA
│   └── templates/         # Templates de página
│       ├── MainLayout/    # Layout principal
│       └── TaskListTemplate/ # Template de lista
├── hooks/                 # Hooks customizados
│   └── useAppState.ts     # Gerenciamento de estado
├── lib/                   # Bibliotecas utilitárias
│   └── api.ts             # Cliente da API
└── types/                 # Definições TypeScript
    └── index.ts           # Tipos da aplicação
```

## 🏗️ Arquitetura Atomic Design

### Metodologia Implementada
O frontend segue os princípios do **Atomic Design** de Brad Frost, criando uma arquitetura de componentes escalável:

```
📦 Componentes
├── 🔬 Atoms (Elementos básicos)
│   ├── Button, Input, Checkbox, Card, LoadingSpinner
│   └── Componentes indivisíveis e reutilizáveis
├── 🧬 Molecules (Combinações simples)
│   ├── TaskItem, TaskForm, AIForm, TaskListHeader
│   └── Combinações de atoms com funcionalidade específica
├── 🦠 Organisms (Componentes complexos)
│   ├── TaskList, TaskListSelector, AISettings
│   └── Seções funcionais completas da interface
├── 📄 Templates (Layouts de página)
│   ├── MainLayout, TaskListTemplate
│   └── Estruturas de página sem conteúdo específico
└── 📱 Pages (Páginas completas)
    └── Implementações específicas dos templates
```

### Benefícios da Arquitetura:
- **🔄 Reutilização**: Componentes atômicos podem ser reutilizados em qualquer lugar
- **🧪 Testabilidade**: Cada componente pode ser testado isoladamente
- **📈 Escalabilidade**: Fácil adição de novas funcionalidades
- **🎨 Consistência**: Design system unificado em toda a aplicação
- **⚡ Performance**: Componentes otimizados e lazy loading

## 🛠️ Como executar a aplicação

### Pré-requisitos
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

### Instalação rápida

1. **Instale as dependências:**
   ```bash
   pnpm install
   ```

2. **Configure o ambiente:**
   ```bash
   cp env.example .env.local
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

4. **Build para produção:**
   ```bash
   pnpm build
   ```

### Acessando a aplicação

Após executar `pnpm dev`, acesse:
- **Interface do usuário**: [http://localhost:3000](http://localhost:3000)

## ✨ Funcionalidades Principais

### Gerenciamento de Tarefas
- ✅ **CRUD Completo**: Criar, ler, atualizar e deletar tarefas
- ✅ **Marcar Conclusão**: Marcar/desmarcar tarefas como concluídas
- ✅ **Edição Inline**: Editar títulos de tarefas diretamente na interface
- ✅ **Reordenação**: Sistema de posicionamento para organização

### Integração com IA
- 🤖 **Configuração de Provedores**: Suporte a Hugging Face e OpenRouter
- 🎯 **Geração Automática**: Criar listas de tarefas a partir de prompts
- 🔐 **Gerenciamento Seguro**: Armazenamento seguro de API Keys
- 🔄 **Atualização em Tempo Real**: Interface sempre sincronizada

### Experiência do Usuário
- 📱 **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- ⚡ **Performance Otimizada**: Build otimizado (28kB página principal)
- 🎨 **Interface Intuitiva**: Navegação clara e fluxo de usuário otimizado
- 🔄 **Atualizações em Tempo Real**: Sem necessidade de recarregar página

## 🔧 Integração com Backend

### Cliente API Centralizado
A comunicação com o backend NestJS é feita através de um cliente centralizado (`src/lib/api.ts`) que oferece:

- **Gerenciamento de Sessão**: Criação e manutenção de sessões de usuário
- **Operações CRUD**: Todas as operações de listas e tarefas
- **Integração IA**: Chamadas para geração automática de tarefas
- **Tratamento de Erros**: Gerenciamento consistente de erros
- **Type Safety**: Tipagem completa para todas as operações

### Gerenciamento de Estado
O estado da aplicação é gerenciado através do hook customizado `useAppState`:

- **Estado do Usuário**: Sessão e configurações
- **Listas de Tarefas**: Todas as listas e seleção atual
- **Estados de Carregamento**: Indicadores de loading e erro
- **Operações CRUD**: Todas as operações de dados
- **Funcionalidades IA**: Integração completa com IA

## 🎨 Sistema de Design

### Tailwind CSS Customizado
- **Paleta de Cores**: Esquema primário (azul) e secundário (cinza)
- **Tipografia**: Família Inter para legibilidade moderna
- **Espaçamento**: Escala consistente de espaçamento
- **Componentes**: Classes pré-construídas para consistência

### Design Responsivo
- **Mobile-First**: Projetado primeiro para dispositivos móveis
- **Breakpoints**: Design responsivo para todos os tamanhos de tela
- **Touch-Friendly**: Otimizado para interações touch
- **Acessibilidade**: Proporções de contraste adequadas e estados de foco

## 📊 Performance e Otimização

### Métricas de Build
```
Route (app)                              Size     First Load JS
┌ ○ /                                    28 kB           110 kB
└ ○ /_not-found                          870 B          82.8 kB
+ First Load JS shared by all            81.9 kB
```

### Otimizações Implementadas
- **Next.js 14**: App Router para performance otimizada
- **Bundle Splitting**: Divisão otimizada de JavaScript
- **Static Generation**: Páginas pré-renderizadas para carregamento rápido
- **Lazy Loading**: Carregamento sob demanda de componentes

## 🛠️ Tecnologias e Padrões

### Stack Tecnológica
- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript com modo strict
- **Styling**: Tailwind CSS com design system customizado
- **HTTP Client**: Axios com interceptors
- **State Management**: Custom hooks para gerenciamento centralizado

### Padrões de Desenvolvimento
- **Atomic Design**: Arquitetura de componentes escalável
- **TypeScript**: Tipagem estática completa
- **ESLint**: Linting consistente para qualidade de código
- **Componentização**: Arquitetura baseada em componentes reutilizáveis
- **Responsive Design**: Interface adaptável para todos os dispositivos

## 📝 Status do Projeto

### ✅ Concluído
- ~~Implementação Atomic Design~~ ✅ **Concluído**
- ~~Integração com Backend~~ ✅ **Concluído**
- ~~Interface Responsiva~~ ✅ **Concluído**
- ~~Gerenciamento de Estado~~ ✅ **Concluído**
- ~~Integração com IA~~ ✅ **Concluído**
- ~~Build Otimizado~~ ✅ **Concluído**

### 🚧 Em desenvolvimento
- Testes de integração
- Otimizações de performance

### 📋 Próximos passos
- Adicionar testes automatizados
- Melhorias de UX/UI
- Deploy em ambiente de produção

## 📄 Documentação Técnica

- **[Frontend Highlights](../docs/frontend-highlights.md)** - Destaques técnicos da implementação
- **[Setup Guide](./SETUP.md)** - Guia de configuração e resolução de problemas
- **[Backend API](../backend/API.md)** - Documentação da API backend
- **[Backend README](../backend/README.md)** - Documentação completa do backend

## 🎯 Destaques Técnicos

### Arquitetura e Design Patterns
- **🏗️ Atomic Design**: Implementação completa da metodologia de Brad Frost
- **📦 Componentização**: Sistema de componentes reutilizáveis e escaláveis
- **📱 Responsive Design**: Interface adaptável para todos os dispositivos
- **🔄 State Management**: Gerenciamento de estado eficiente com custom hooks

### Qualidade de Código
- **🔒 TypeScript**: Tipagem estática completa para maior segurança
- **📏 ESLint**: Linting consistente e configurações otimizadas
- **📚 Documentação**: READMEs detalhados e documentação técnica completa
- **🎨 Design System**: Sistema de design consistente com Tailwind CSS

### Performance e Otimização
- **⚡ Next.js 14**: App Router para performance otimizada
- **📦 Build Otimizado**: Bundle otimizado para produção (28kB página principal)
- **🔄 Real-time**: Atualizações em tempo real sem recarregar página
- **📡 API Client**: Cliente HTTP otimizado com interceptors e tratamento de erros
