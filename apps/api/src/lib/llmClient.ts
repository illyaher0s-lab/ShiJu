/**
 * Unified LLM API client
 * 
 * Rules:
 * 1. All LLM requests MUST go through this module
 * 2. No direct fetch/axios calls to LLM APIs in business logic
 * 3. Configuration MUST come from environment variables only
 * 4. Missing configuration MUST fail loudly (no silent fallbacks)
 * 5. Errors MUST be classified (config/auth/model/network/format)
 */

export interface LLMClientConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  provider: string;
}

export enum LLMErrorType {
  CONFIG_MISSING = 'CONFIG_MISSING',
  AUTH_FAILED = 'AUTH_FAILED',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

export class LLMError extends Error {
  constructor(
    public type: LLMErrorType,
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

export interface LLMToolChoice {
  type: 'function';
  function: {
    name: string;
  };
}

export interface LLMToolCall {
  id?: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface LLMCallOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
  tools?: LLMTool[];
  toolChoice?: LLMToolChoice | 'auto' | 'none';
}

export interface LLMResponse {
  content: string;
  toolCalls?: LLMToolCall[];
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Validate configuration and throw LLMError if invalid
 */
export function validateConfig(config: Partial<LLMClientConfig>): asserts config is LLMClientConfig {
  const missing: string[] = [];
  
  if (!config.baseUrl) missing.push('AI_BASE_URL');
  if (!config.apiKey) missing.push('AI_API_KEY');
  if (!config.model) missing.push('AI_MODEL');
  if (!config.provider) missing.push('AI_PROVIDER');
  
  if (missing.length > 0) {
    throw new LLMError(
      LLMErrorType.CONFIG_MISSING,
      `Missing required LLM configuration: ${missing.join(', ')}. Check your environment variables.`
    );
  }
}

/**
 * Call OpenAI-compatible LLM API
 * 
 * @throws {LLMError} with classified error type
 */
export async function callLLM(config: LLMClientConfig, options: LLMCallOptions): Promise<LLMResponse> {
  validateConfig(config);
  
  // Normalize base URL: ensure it ends with /v1 for OpenAI-compatible APIs
  let baseUrl = config.baseUrl.replace(/\/$/, '');
  if (!baseUrl.includes('/v1')) {
    baseUrl += '/v1';
  }
  const endpoint = `${baseUrl}/chat/completions`;
  
  try {
    const requestBody: any = {
      model: config.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      ...(options.responseFormat === 'json_object' && {
        response_format: { type: 'json_object' },
      }),
    };

    // Add tool calling parameters if provided
    if (options.tools && options.tools.length > 0) {
      requestBody.tools = options.tools;
      if (options.toolChoice) {
        requestBody.tool_choice = options.toolChoice;
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    // Classify HTTP errors
    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unable to read error body');
      
      if (response.status === 401 || response.status === 403) {
        throw new LLMError(
          LLMErrorType.AUTH_FAILED,
          `Authentication failed (${response.status}). Check AI_API_KEY.`,
          response.status
        );
      }
      
      if (response.status === 404) {
        throw new LLMError(
          LLMErrorType.MODEL_NOT_FOUND,
          `Model not found (${response.status}). Check AI_MODEL: ${config.model}`,
          response.status
        );
      }
      
      if (response.status === 429) {
        throw new LLMError(
          LLMErrorType.RATE_LIMIT,
          `Rate limit exceeded (${response.status}). Try again later.`,
          response.status
        );
      }
      
      throw new LLMError(
        LLMErrorType.UNKNOWN,
        `LLM API request failed (${response.status}): ${errorBody}`,
        response.status
      );
    }
    
    // Parse response
    let payload: any;
    try {
      payload = await response.json();
    } catch (e) {
      throw new LLMError(
        LLMErrorType.INVALID_RESPONSE,
        'LLM API returned invalid JSON',
        response.status,
        e
      );
    }
    
    // Validate response structure
    const content = payload.choices?.[0]?.message?.content;
    const toolCalls = payload.choices?.[0]?.message?.tool_calls;
    const finishReason = payload.choices?.[0]?.finish_reason;
    
    if (typeof content !== 'string' && !toolCalls) {
      throw new LLMError(
        LLMErrorType.INVALID_RESPONSE,
        'LLM API response missing both content and tool_calls'
      );
    }
    
    return {
      content: content || '',
      toolCalls: toolCalls,
      finishReason: finishReason,
      usage: payload.usage ? {
        promptTokens: payload.usage.prompt_tokens ?? 0,
        completionTokens: payload.usage.completion_tokens ?? 0,
        totalTokens: payload.usage.total_tokens ?? 0,
      } : undefined,
    };
    
  } catch (error) {
    // Re-throw LLMError as-is
    if (error instanceof LLMError) {
      throw error;
    }
    
    // Wrap network errors
    if (error instanceof TypeError || (error as any).code === 'ECONNREFUSED') {
      throw new LLMError(
        LLMErrorType.NETWORK_ERROR,
        `Network error connecting to LLM API: ${endpoint}`,
        undefined,
        error
      );
    }
    
    // Unknown error
    throw new LLMError(
      LLMErrorType.UNKNOWN,
      `Unexpected error calling LLM API: ${error}`,
      undefined,
      error
    );
  }
}
