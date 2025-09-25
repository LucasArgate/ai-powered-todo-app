# Configuração de CI/CD

Este documento explica como funciona o sistema de CI/CD configurado para o projeto AI-Powered Todo App.

## Visão Geral

O projeto utiliza GitHub Actions para automatizar testes, builds e deployments quando há commits na branch `develop`.

## Workflows Configurados

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

**Trigger:** Commits na branch `develop` e Pull Requests para `develop`

**Jobs:**
- **test-backend**: Executa testes, linting e cobertura do backend
- **test-frontend**: Executa testes, linting e cobertura do frontend  
- **build-and-deploy**: Build completo e preparação para deploy (apenas na branch develop)

### 2. Pull Request Checks (`.github/workflows/pr-checks.yml`)

**Trigger:** Pull Requests para `develop` ou `main`

**Funcionalidades:**
- Validação de código (linting)
- Execução de testes
- Build das aplicações
- Comentário automático no PR com status

## Scripts Disponíveis

### Root Level (Monorepo)
```bash
# Executar todos os testes
pnpm test

# Executar testes do backend
pnpm test-api

# Executar testes do frontend
pnpm test-app

# Executar linting completo
pnpm lint

# Build completo
pnpm build
```

### Backend
```bash
# Testes unitários
pnpm test

# Testes com watch mode
pnpm test:watch

# Testes com cobertura
pnpm test:cov

# Testes e2e
pnpm test:e2e
```

### Frontend
```bash
# Testes unitários
pnpm test

# Testes com watch mode
pnpm test:watch

# Testes com cobertura
pnpm test:coverage
```

## Configuração de Testes

### Backend (NestJS)
- **Framework:** Jest
- **Configuração:** `jest.config.js`
- **Cobertura:** Configurada para gerar relatórios em `coverage/`

### Frontend (Next.js)
- **Framework:** Jest + React Testing Library
- **Configuração:** `jest.config.js` + `jest.setup.js`
- **Ambiente:** jsdom para testes de componentes React

## Integração com Codecov

O projeto está configurado para enviar relatórios de cobertura para o Codecov:

- **Configuração:** `codecov.yml`
- **Target de cobertura:** 80%
- **Threshold:** 5%

## Como Usar

### Para Desenvolvedores

1. **Antes de fazer commit:**
   ```bash
   # Execute os testes localmente
   pnpm test
   
   # Execute o linting
   pnpm lint
   ```

2. **Criando Pull Requests:**
   - O workflow `pr-checks.yml` será executado automaticamente
   - Verifique os comentários automáticos no PR para status

3. **Commits na branch develop:**
   - O workflow `ci.yml` será executado automaticamente
   - Inclui testes, builds e preparação para deploy

### Para Administradores

1. **Configurar Codecov (opcional):**
   - Conectar o repositório no [Codecov](https://codecov.io)
   - Adicionar token de acesso se necessário

2. **Configurar Deployment:**
   - Editar o job `build-and-deploy` em `.github/workflows/ci.yml`
   - Adicionar steps específicos para sua plataforma de deploy

## Troubleshooting

### Testes Falhando
- Verifique se todas as dependências estão instaladas
- Execute `pnpm install` para sincronizar dependências
- Verifique se os arquivos de configuração estão corretos

### Linting Falhando
- Execute `pnpm lint` localmente para ver erros
- Use `pnpm lint --fix` para correções automáticas

### Build Falhando
- Verifique se não há erros de TypeScript
- Execute `pnpm build` localmente para debug

## Próximos Passos

1. **Configurar deployment automático** para staging/production
2. **Adicionar testes de integração** mais robustos
3. **Configurar notificações** (Slack, Discord, etc.)
4. **Implementar cache** para builds mais rápidos
5. **Adicionar testes de performance** se necessário
