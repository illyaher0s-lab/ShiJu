#!/usr/bin/env tsx

/**
 * API Connection Validation Script
 * 
 * Usage:
 *   pnpm test:api
 * 
 * This script:
 * 1. Loads environment variables from .env
 * 2. Validates required fields are present
 * 3. Makes a real LLM API call
 * 4. Reports success or detailed error
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { callLLM, validateConfig, LLMError, LLMErrorType, type LLMClientConfig } from '../apps/api/src/lib/llmClient';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
const envPath = resolve(__dirname, '../.env');
console.log(`Loading environment from: ${envPath}`);
config({ path: envPath });

async function main() {
  console.log('\n🔍 Validating API Configuration...\n');
  
  // Build config from environment
  const llmConfig: Partial<LLMClientConfig> = {
    baseUrl: process.env.AI_BASE_URL,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL,
    provider: process.env.AI_PROVIDER,
  };
  
  // Step 1: Validate configuration
  try {
    validateConfig(llmConfig);
    console.log('✅ Configuration validation passed');
    console.log(`   Provider: ${llmConfig.provider}`);
    console.log(`   Base URL: ${llmConfig.baseUrl}`);
    console.log(`   Model: ${llmConfig.model}`);
    console.log(`   API Key: ${llmConfig.apiKey?.substring(0, 10)}...`);
  } catch (error) {
    if (error instanceof LLMError && error.type === LLMErrorType.CONFIG_MISSING) {
      console.error('❌ Configuration validation failed');
      console.error(`   ${error.message}`);
      console.error('\n💡 Fix: Create a .env file in project root with:');
      console.error('   AI_PROVIDER=openai_compatible');
      console.error('   AI_BASE_URL=https://your-api-endpoint.com');
      console.error('   AI_API_KEY=sk-your-key-here');
      console.error('   AI_MODEL=your-model-name');
      process.exit(1);
    }
    throw error;
  }
  
  // Step 2: Test real API call
  console.log('\n🚀 Testing API connection...\n');
  
  try {
    const result = await callLLM(llmConfig as LLMClientConfig, {
      messages: [
        {
          role: 'user',
          content: 'Reply with a single word: "OK"'
        }
      ],
      maxTokens: 10,
    });
    
    console.log('✅ API call successful');
    console.log(`   Response: ${result.content.substring(0, 100)}`);
    if (result.usage) {
      console.log(`   Tokens used: ${result.usage.totalTokens} (prompt: ${result.usage.promptTokens}, completion: ${result.usage.completionTokens})`);
    }
    
    console.log('\n✨ All checks passed! Your API is configured correctly.\n');
    
  } catch (error) {
    if (error instanceof LLMError) {
      console.error('❌ API call failed');
      console.error(`   Error type: ${error.type}`);
      console.error(`   Message: ${error.message}`);
      if (error.statusCode) {
        console.error(`   HTTP status: ${error.statusCode}`);
      }
      
      // Provide specific guidance based on error type
      console.error('\n💡 Troubleshooting:');
      switch (error.type) {
        case LLMErrorType.AUTH_FAILED:
          console.error('   - Verify AI_API_KEY is correct');
          console.error('   - Check if API key has expired');
          console.error('   - Confirm API key has necessary permissions');
          break;
        case LLMErrorType.MODEL_NOT_FOUND:
          console.error(`   - Verify AI_MODEL="${llmConfig.model}" exists at your provider`);
          console.error('   - Check model name spelling and capitalization');
          break;
        case LLMErrorType.NETWORK_ERROR:
          console.error(`   - Verify AI_BASE_URL="${llmConfig.baseUrl}" is reachable`);
          console.error('   - Check firewall and network connectivity');
          console.error('   - Try: curl -I ' + llmConfig.baseUrl);
          break;
        case LLMErrorType.RATE_LIMIT:
          console.error('   - Wait a few minutes and try again');
          console.error('   - Check your API usage quota');
          break;
        case LLMErrorType.INVALID_RESPONSE:
          console.error('   - Provider may not be OpenAI-compatible');
          console.error('   - Check provider documentation for correct endpoint format');
          break;
      }
      
      process.exit(1);
    }
    
    // Unknown error
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
