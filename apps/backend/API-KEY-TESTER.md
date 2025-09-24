# Testador de API Key - Documentação

## Visão Geral

O testador de API key permite validar se uma API key está funcionando corretamente com os provedores de IA suportados antes de configurar a integração no perfil do usuário.

## Endpoints Disponíveis

### 1. Teste Público (sem autenticação)
**POST** `/ai-public/test-api-key`

Este endpoint não requer autenticação e é ideal para testar API keys antes de configurá-las.

### 2. Teste do Usuário Logado
**POST** `/ai/test-api-key`

Este endpoint requer autenticação Bearer token e testa a API key já configurada no perfil do usuário logado.

## Parâmetros da Requisição

### Endpoint Público (`/ai-public/test-api-key`)
```json
{
  "apiKey": "sua_api_key_aqui",
  "provider": "huggingface", // ou "openrouter"
  "model": "gpt-3.5-turbo" // opcional
}
```

### Endpoint do Usuário Logado (`/ai/test-api-key`)
```json
{
  "provider": "huggingface", // ou "openrouter"
  "model": "gpt-3.5-turbo" // opcional
}
```

### Campos Obrigatórios
- **Endpoint Público**: `apiKey` (a chave de API para testar) e `provider`
- **Endpoint do Usuário**: `provider` (a API key é pega do perfil do usuário logado)

### Campos Opcionais
- `model`: Modelo específico do provedor (se não fornecido, usa o padrão)

## Resposta da API

### Sucesso (200)
```json
{
  "valid": true,
  "message": "API key está funcionando corretamente",
  "provider": "huggingface",
  "model": "gpt-3.5-turbo"
}
```

### Erro (400)
```json
{
  "valid": false,
  "message": "API key inválida ou expirada",
  "provider": "huggingface",
  "model": "gpt-3.5-turbo"
}
```

## Exemplos de Uso

### 1. Testando API Key do Hugging Face

```bash
curl -X POST http://localhost:3001/ai-public/test-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "provider": "huggingface"
  }'
```

### 2. Testando API Key do OpenRouter (Público)

```bash
curl -X POST http://localhost:3001/ai-public/test-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "provider": "openrouter",
    "model": "openai/gpt-3.5-turbo"
  }'
```

### 3. Testando API Key do Usuário Logado

```bash
curl -X POST http://localhost:3001/ai/test-api-key \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_jwt_token_aqui" \
  -d '{
    "provider": "huggingface",
    "model": "gpt-3.5-turbo"
  }'
```

### 4. Teste com JavaScript/Fetch

#### Teste Público
```javascript
const testApiKey = async (apiKey, provider, model) => {
  try {
    const response = await fetch('http://localhost:3001/ai-public/test-api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        provider,
        model
      })
    });

    const result = await response.json();
    
    if (result.valid) {
      console.log('✅ API key válida:', result.message);
    } else {
      console.log('❌ API key inválida:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao testar API key:', error);
  }
};

// Exemplo de uso público
testApiKey('hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'huggingface');
```

#### Teste do Usuário Logado
```javascript
const testUserApiKey = async (provider, model, authToken) => {
  try {
    const response = await fetch('http://localhost:3001/ai/test-api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        provider,
        model
      })
    });

    const result = await response.json();
    
    if (result.valid) {
      console.log('✅ API key do usuário válida:', result.message);
    } else {
      console.log('❌ API key do usuário inválida:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao testar API key do usuário:', error);
  }
};

// Exemplo de uso do usuário logado
testUserApiKey('huggingface', 'gpt-3.5-turbo', 'seu_jwt_token');
```

## Mensagens de Erro Comuns

| Mensagem | Descrição | Solução |
|----------|-----------|---------|
| `API key inválida ou expirada` | A API key não é válida ou expirou | Verifique se a API key está correta e não expirou |
| `Usuário não possui API key configurada` | Usuário não tem API key salva no perfil | Configure a API key no perfil do usuário primeiro |
| `Modelo não disponível ou não encontrado` | O modelo especificado não existe | Use um modelo válido para o provedor |
| `Limite de requisições excedido` | Rate limit atingido | Aguarde alguns minutos antes de tentar novamente |
| `API key é obrigatória` | Campo apiKey não foi fornecido (endpoint público) | Forneça uma API key válida |
| `Provedor não suportado` | Provider não é suportado | Use `huggingface` ou `openrouter` |

## Provedores Suportados

### Hugging Face
- **Gratuito**: Sim
- **Modelos**: `microsoft/DialoGPT-large`, `gpt2`, `distilgpt2`
- **Como obter API key**: [Hugging Face Settings](https://huggingface.co/settings/tokens)

### OpenRouter
- **Gratuito**: Não (pago)
- **Modelos**: `openai/gpt-3.5-turbo`, `anthropic/claude-3-haiku`
- **Como obter API key**: [OpenRouter Dashboard](https://openrouter.ai/keys)

## Integração com Frontend

Estes endpoints podem ser usados no frontend para:

1. **Validação em tempo real**: Testar API keys enquanto o usuário digita (endpoint público)
2. **Configuração de perfil**: Validar antes de salvar no perfil do usuário (endpoint público)
3. **Verificação de status**: Testar se a API key salva ainda está funcionando (endpoint do usuário)
4. **Feedback imediato**: Mostrar status da API key na interface

### Exemplo de Componente React

#### Testador Público (para configurar API key)
```jsx
import { useState } from 'react';

const ApiKeyTester = () => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('huggingface');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testApiKey = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/ai-public/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, provider })
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ valid: false, message: 'Erro de conexão' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <input 
        value={apiKey} 
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Digite sua API key"
      />
      <select value={provider} onChange={(e) => setProvider(e.target.value)}>
        <option value="huggingface">Hugging Face</option>
        <option value="openrouter">OpenRouter</option>
      </select>
      <button onClick={testApiKey} disabled={testing}>
        {testing ? 'Testando...' : 'Testar API Key'}
      </button>
      
      {testResult && (
        <div className={testResult.valid ? 'success' : 'error'}>
          {testResult.message}
        </div>
      )}
    </div>
  );
};
```

#### Testador do Usuário Logado (para verificar status)
```jsx
import { useState } from 'react';

const UserApiKeyTester = ({ authToken }) => {
  const [provider, setProvider] = useState('huggingface');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testUserApiKey = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/ai/test-api-key', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ provider })
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ valid: false, message: 'Erro de conexão' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <select value={provider} onChange={(e) => setProvider(e.target.value)}>
        <option value="huggingface">Hugging Face</option>
        <option value="openrouter">OpenRouter</option>
      </select>
      <button onClick={testUserApiKey} disabled={testing}>
        {testing ? 'Testando...' : 'Verificar API Key'}
      </button>
      
      {testResult && (
        <div className={testResult.valid ? 'success' : 'error'}>
          {testResult.message}
        </div>
      )}
    </div>
  );
};
```

## Notas Importantes

1. **Segurança**: O endpoint público não armazena as API keys, apenas as testa
2. **Rate Limiting**: Respeite os limites dos provedores de IA
3. **Timeout**: O teste tem timeout de 30 segundos
4. **Logs**: Todas as tentativas de teste são logadas no backend
5. **Modelos**: Nem todos os modelos estão disponíveis em todos os provedores
