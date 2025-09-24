# TDD Strategy for AI-Powered Todo App Backend

## Overview

This document outlines the Test-Driven Development (TDD) strategy for the AI-Powered Todo App backend, including infrastructure setup, testing approaches, and CI/CD workflow integration.

## Current State Analysis

### ✅ Already Configured
- Jest testing framework with basic configuration
- NestJS Testing Module setup
- Basic test structure (unit and e2e)
- Prisma with SQLite for development
- npm scripts for testing (`test`, `test:watch`, `test:cov`, `test:e2e`)

### ❌ Missing for Perfect TDD
- Comprehensive unit tests (currently only basic "should be defined" tests)
- Test database configuration and isolation
- Robust integration tests
- CI/CD pipeline with GitHub Actions
- Pre-commit hooks for automated testing
- Proper test coverage configuration
- Mocks for external services (AI providers)
- Test data fixtures and helpers

## Proposed TDD Infrastructure

### Test Structure
```
apps/backend/
├── src/
├── test/
│   ├── unit/              # Isolated unit tests
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   ├── integration/       # Service integration tests
│   ├── e2e/              # End-to-end API tests
│   ├── fixtures/         # Test data and mocks
│   │   ├── users.fixture.ts
│   │   ├── tasks.fixture.ts
│   │   └── task-lists.fixture.ts
│   └── helpers/          # Test utilities
│       ├── database.helper.ts
│       ├── auth.helper.ts
│       └── mock.helper.ts
├── .github/
│   └── workflows/
│       ├── ci.yml         # Main CI pipeline
│       ├── coverage.yml   # Coverage reporting
│       └── deploy.yml     # Automated deployment
└── test-db/              # Test database files
```

### Enhanced Jest Configuration

```javascript
// jest.config.js (enhanced)
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.interface.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
  testTimeout: 10000,
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

## Testing Strategy by Component

### 1. Unit Tests

#### TasksService Tests
- **create()**: Test task creation with valid/invalid data, position calculation, user ownership validation
- **update()**: Test task updates, user authorization, data validation
- **remove()**: Test task deletion, user authorization, cascade effects
- **toggleComplete()**: Test status toggle functionality
- **findOneWithUserCheck()**: Test private method for user validation

#### TaskListsService Tests
- **create()**: Test list creation, user validation, data integrity
- **update()**: Test list updates, user authorization
- **remove()**: Test list deletion, cascade effects on tasks
- **findByUserIdWithTasksAndCounts()**: Test aggregation queries, task counting
- **findOneWithUserCheck()**: Test user ownership validation

#### AiService Tests
- **generateTasksFromPrompt()**: Mock external AI services, test task generation flow
- **generateTaskListFromPrompt()**: Test complete list generation workflow
- **generateListTitle()**: Test AI title generation with fallbacks
- **generateListDescription()**: Test AI description generation with fallbacks
- **getAvailableProviders()**: Test provider information retrieval

#### UsersService Tests
- **create()**: Test user creation, validation
- **findOne()**: Test user retrieval, error handling
- **update()**: Test user updates, AI token management
- **remove()**: Test user deletion, cascade effects

### 2. Integration Tests

#### Database Integration
- Test Prisma operations with real database
- Test transaction handling
- Test cascade deletions
- Test data integrity constraints

#### Service Integration
- Test service-to-service communication
- Test error propagation
- Test data flow between services

### 3. End-to-End Tests

#### API Endpoints
- **POST /tasks**: Test task creation flow
- **GET /tasks**: Test task retrieval with filters
- **PUT /tasks/:id**: Test task updates
- **DELETE /tasks/:id**: Test task deletion
- **POST /task-lists**: Test list creation
- **GET /task-lists**: Test list retrieval with tasks
- **POST /ai/generate-tasks**: Test AI task generation
- **POST /ai/generate-task-list**: Test AI list generation

#### Authentication & Authorization
- Test user ownership validation
- Test unauthorized access scenarios
- Test data isolation between users

## Test Database Configuration

### Separate Test Database
```typescript
// test/database.config.ts
export const testDatabaseConfig = {
  provider: 'sqlite',
  url: 'file:./test-db/test.db',
  // Use in-memory database for faster tests
  // url: 'file::memory:?cache=shared',
};
```

### Test Setup and Teardown
```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
  // Run migrations
  // Seed test data
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database between tests
  await prisma.task.deleteMany();
  await prisma.taskList.deleteMany();
  await prisma.user.deleteMany();
});
```

## CI/CD Pipeline Strategy

### GitHub Actions Workflow

#### Main CI Pipeline (`.github/workflows/ci.yml`)
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run unit tests
        run: pnpm test:cov
      
      - name: Run integration tests
        run: pnpm test:integration
      
      - name: Run e2e tests
        run: pnpm test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

#### Pre-commit Hooks
```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
pnpm test --passWithNoTests
```

## TDD Workflow Process

### 1. Red Phase
- Write a failing test that describes the desired behavior
- Run tests to confirm they fail
- Commit the failing test

### 2. Green Phase
- Write minimal code to make the test pass
- Run tests to confirm they pass
- Commit the implementation

### 3. Refactor Phase
- Improve code quality while keeping tests green
- Run tests frequently to ensure no regressions
- Commit refactored code

### 4. Integration Phase
- Run full test suite
- Check coverage reports
- Create Pull Request with test results

## Testing Best Practices

### Test Organization
- One test file per source file
- Group related tests using `describe` blocks
- Use descriptive test names that explain the behavior
- Follow AAA pattern: Arrange, Act, Assert

### Mocking Strategy
- Mock external services (AI providers, databases in unit tests)
- Use real services in integration tests
- Create reusable mock factories
- Mock at the boundary of your application

### Test Data Management
- Use factories for creating test data
- Keep test data minimal and focused
- Clean up test data between tests
- Use fixtures for complex test scenarios

### Coverage Goals
- **Unit Tests**: 90%+ coverage for business logic
- **Integration Tests**: 80%+ coverage for API endpoints
- **E2E Tests**: Cover critical user journeys

## Implementation Priority

### Phase 1: Infrastructure Setup
1. Enhanced Jest configuration
2. Test database setup
3. Test helpers and fixtures
4. Basic CI pipeline

### Phase 2: Core Service Tests
1. TasksService unit tests
2. TaskListsService unit tests
3. UsersService unit tests
4. Database integration tests

### Phase 3: Advanced Testing
1. AiService tests with mocking
2. API endpoint integration tests
3. E2E test scenarios
4. Performance testing

### Phase 4: CI/CD Enhancement
1. Advanced GitHub Actions workflows
2. Pre-commit hooks
3. Coverage reporting
4. Automated deployment

## Success Metrics

- **Test Coverage**: Maintain 80%+ overall coverage
- **Build Time**: Keep CI pipeline under 5 minutes
- **Test Reliability**: 99%+ test pass rate
- **Developer Experience**: Fast feedback loop (< 30 seconds for unit tests)

## Tools and Dependencies

### Testing Tools
- **Jest**: Test framework and runner
- **Supertest**: HTTP assertion library
- **@nestjs/testing**: NestJS testing utilities
- **Prisma**: Database testing utilities

### CI/CD Tools
- **GitHub Actions**: CI/CD pipeline
- **Codecov**: Coverage reporting
- **Husky**: Git hooks
- **lint-staged**: Pre-commit linting

### Mocking Tools
- **Jest**: Built-in mocking capabilities
- **nock**: HTTP request mocking
- **@prisma/client**: Database mocking utilities

---

*This document serves as a comprehensive guide for implementing TDD in the AI-Powered Todo App backend. It should be updated as the testing strategy evolves and new requirements emerge.*
