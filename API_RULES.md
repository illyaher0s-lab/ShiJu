# API Configuration Rules

## Problem Statement

Previous deployments failed because:
1. Business code directly called placeholder/mock APIs without knowing
2. API credentials were hardcoded in component files
3. Configuration errors were silently ignored with fallbacks
4. No validation at startup — errors only appeared during runtime

## Solution: Unified API Client

All LLM API calls **MUST** go through `apps/api/src/lib/llmClient.ts`.

---

## Rules

### ✅ ALLOWED

1. **Configuration Source:**
   - Read API config from environment variables only
   - Use `apps/api/src/config.ts` to load environment variables
   - Example: `const config = loadConfig();`

2. **API Calls:**
   - Import and use `callLLM()` from `apps/api/src/lib/llmClient.ts`
   - Pass configuration and messages as parameters
   - Handle `LLMError` exceptions with type checking

3. **Error Handling:**
   - Catch `LLMError` and check `.type` property
   - Distinguish between config/auth/model/network/format errors
   - Log errors with context (which operation failed, what was requested)

4. **Testing:**
   - Use mock provider (`AI_PROVIDER=mock`) for tests
   - Run `pnpm test:api` to verify real API connection before deployment

---

### ❌ FORBIDDEN

1. **Direct API Calls:**
   ```typescript
   // ❌ NEVER DO THIS
   fetch('https://api.openai.com/v1/chat/completions', {
     headers: { Authorization: 'Bearer sk-...' }
   });
   ```

2. **Hardcoded Configuration:**
   ```typescript
   // ❌ NEVER DO THIS
   const API_KEY = 'sk-893d03a76ade52ca7618a21711b43d7b65f68fab061666cbb8ecf213f06967b4';
   const BASE_URL = 'https://cc-vibe.com';
   ```

3. **Silent Fallbacks:**
   ```typescript
   // ❌ NEVER DO THIS
   const provider = process.env.AI_PROVIDER ?? 'mock'; // Silent fallback hides missing config
   ```

4. **Business Logic with API Details:**
   ```typescript
   // ❌ NEVER DO THIS in React components or services
   const response = await fetch(`${baseUrl}/chat/completions`, {...});
   ```

5. **Placeholder APIs in Production:**
   - Never commit real API keys to git
   - Never use demo/test API endpoints in `.env` files
   - Never assume "it will be configured later"

---

## File Structure

```
apps/api/src/
├── lib/
│   └── llmClient.ts           ← ONLY place for LLM HTTP requests
├── config.ts                   ← ONLY place for environment variable loading
├── ai/
│   ├── provider.ts             ← Interface definition
│   ├── mockProvider.ts         ← Test/development provider
│   └── openAiCompatibleProvider.ts  ← Uses llmClient.ts
└── services/
    └── generationService.ts    ← Business logic, uses ai/provider.ts interface
```

**Configuration Flow:**
```
Environment Variables (.env)
    ↓
config.ts (validation + load)
    ↓
llmClient.ts (typed config + error classification)
    ↓
openAiCompatibleProvider.ts (domain-specific prompts)
    ↓
Business Services (generation, review, etc.)
```

---

## Configuration Validation

### Startup Validation

When `AI_PROVIDER=openai_compatible`, the server **MUST** have:
- `AI_BASE_URL` (API endpoint)
- `AI_API_KEY` (authentication token)
- `AI_MODEL` (model identifier)

If any are missing, `loadConfig()` will throw an error **before** the server starts.

### Runtime Validation

Before each LLM call, `callLLM()` validates:
- Configuration is complete
- Response structure matches expected format
- Error responses are classified correctly

---

## Error Classification

All LLM errors are wrapped in `LLMError` with a typed `.type` field:

| Error Type | Meaning | Action |
|------------|---------|--------|
| `CONFIG_MISSING` | Missing `AI_BASE_URL`, `AI_API_KEY`, or `AI_MODEL` | Check environment variables |
| `AUTH_FAILED` | 401/403 response | Verify `AI_API_KEY` is valid |
| `MODEL_NOT_FOUND` | 404 response | Verify `AI_MODEL` exists at provider |
| `NETWORK_ERROR` | Connection refused / timeout | Check `AI_BASE_URL` is reachable |
| `INVALID_RESPONSE` | Malformed JSON or missing fields | Check provider compatibility |
| `RATE_LIMIT` | 429 response | Wait and retry |
| `UNKNOWN` | Other errors | Check logs for details |

**Example:**
```typescript
import { callLLM, LLMError, LLMErrorType } from '../lib/llmClient';

try {
  const result = await callLLM(config, { messages: [...] });
} catch (error) {
  if (error instanceof LLMError) {
    switch (error.type) {
      case LLMErrorType.CONFIG_MISSING:
        console.error('Setup error:', error.message);
        break;
      case LLMErrorType.AUTH_FAILED:
        console.error('Invalid API key:', error.message);
        break;
      // ... handle other types
    }
  }
  throw error; // Re-throw for upstream handling
}
```

---

## Testing

### Before Deployment

Run the API validation script:

```bash
pnpm test:api
```

This script:
1. Loads environment variables from `.env`
2. Validates all required fields are present
3. Makes a real LLM API call with a simple prompt
4. Reports success or detailed error classification

### During Development

Use mock provider to avoid API costs:

```bash
# .env.local
AI_PROVIDER=mock
```

Mock provider returns deterministic responses without network calls.

---

## Security

1. **Never commit `.env` to git**
   - Use `.env.example` as a template
   - Real credentials belong in deployment environment only

2. **Rotate compromised keys immediately**
   - If a key is committed to git, assume it's public
   - Revoke and generate new credentials

3. **Use least-privilege API keys**
   - Request only necessary scopes
   - Set spending limits if provider supports it

---

## Checklist

Before merging code that uses LLM APIs:

- [ ] No `fetch()` or `axios()` calls to LLM endpoints in business logic
- [ ] No hardcoded API URLs, keys, or model names
- [ ] All configuration loaded from environment variables
- [ ] Used `callLLM()` from `llmClient.ts`
- [ ] Handled `LLMError` with type checking
- [ ] Tested with `pnpm test:api` successfully
- [ ] Updated `.env.example` if new variables added
- [ ] Verified `.env` is in `.gitignore`

---

## Examples

### ✅ Correct Usage

```typescript
// apps/api/src/services/generationService.ts
import { callLLM, type LLMClientConfig } from '../lib/llmClient';

export async function generateCandidates(config: LLMClientConfig, segmentText: string) {
  const result = await callLLM(config, {
    messages: [
      { role: 'user', content: buildPrompt(segmentText) }
    ],
    responseFormat: 'json_object',
  });
  
  return JSON.parse(result.content);
}
```

### ❌ Incorrect Usage

```typescript
// ❌ BAD: Direct API call in business logic
export async function generateCandidates(segmentText: string) {
  const response = await fetch('https://cc-vibe.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk-893d03a76ade52ca7618a21711b43d7b65f68fab061666cbb8ecf213f06967b4'
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', messages: [...] })
  });
  
  return await response.json();
}
```

---

## Questions?

If you're unsure whether your code follows these rules, ask:

1. **Am I calling `fetch()` or `axios()` to an LLM endpoint?**
   → If yes, use `callLLM()` instead

2. **Am I reading API config from anywhere other than environment variables?**
   → If yes, move it to `.env` and use `loadConfig()`

3. **Does my code handle missing configuration gracefully?**
   → If yes, remove silent fallbacks — fail loudly instead

4. **Can I test my code without a real API key?**
   → If no, add support for mock provider

---

**Last Updated:** 2026-06-15
