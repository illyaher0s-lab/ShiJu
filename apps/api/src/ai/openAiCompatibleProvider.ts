import type { CandidateExpression } from "@art/domain";
import type { AiProvider } from "./provider";
import { callLLM, type LLMClientConfig } from "../lib/llmClient";

export interface OpenAiCompatibleProviderOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
}

// Tool schema for structured candidate generation
const CREATE_CANDIDATES_TOOL = {
  type: "function" as const,
  function: {
    name: "create_candidate_expressions",
    description: "Generate candidate expressions for English reading comprehension",
    parameters: {
      type: "object",
      properties: {
        candidates: {
          type: "array",
          description: "List of candidate expressions",
          minItems: 5,
          maxItems: 30,
          items: {
            type: "object",
            required: [
              "expression",
              "normalized_form",
              "type",
              "meaning_zh",
              "local_meaning",
              "sentence",
              "sentence_translation",
              "syntax_hint",
              "difficulty",
              "value_score",
              "candidate_status",
              "status_reason",
              "occurrence_count"
            ],
            properties: {
              expression: {
                type: "string",
                description: "The target expression (phrasal verb, collocation, idiom, etc.)"
              },
              normalized_form: {
                type: "string",
                description: "Canonical form for deduplication (e.g., 'pick up' for 'picked up')"
              },
              type: {
                type: "string",
                enum: ["phrasal_verb", "collocation", "idiom", "sentence_pattern", "other"],
                description: "Expression type"
              },
              meaning_zh: {
                type: "string",
                description: "Chinese translation of the general meaning"
              },
              local_meaning: {
                type: "string",
                description: "English definition specific to this context"
              },
              sentence: {
                type: "string",
                description: "Example sentence from the segment"
              },
              sentence_translation: {
                type: "string",
                description: "Chinese translation of the example sentence"
              },
              syntax_hint: {
                type: "string",
                description: "Grammatical or usage notes"
              },
              difficulty: {
                type: "string",
                enum: ["A2", "B1", "B2", "C1", "C2"],
                description: "CEFR difficulty level"
              },
              value_score: {
                type: "number",
                minimum: 1,
                maximum: 10,
                description: "Learning value score (1-10)"
              },
              candidate_status: {
                type: "string",
                enum: ["selected", "backup_candidate", "ignored_too_easy", "ignored_duplicate", "ignored_over_limit"],
                description: "Selection status: selected (top priority), backup_candidate (alternative), ignored_too_easy (too common), ignored_duplicate (already covered), ignored_over_limit (exceeds quota)"
              },
              status_reason: {
                type: "string",
                description: "Reason for the selection status"
              },
              occurrence_count: {
                type: "integer",
                minimum: 1,
                description: "Number of times this expression appears in the segment"
              }
            }
          }
        }
      },
      required: ["candidates"]
    }
  }
};

// Tool schema for manual selection draft
const CREATE_MANUAL_SELECTION_TOOL = {
  type: "function" as const,
  function: {
    name: "create_manual_selection_draft",
    description: "Generate a learning card for a user-selected expression",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The selected expression (as-is from user selection)"
        },
        normalized_form: {
          type: "string",
          description: "Canonical form (e.g., 'pick up' for 'picked up', lowercase)"
        },
        type: {
          type: "string",
          enum: ["phrasal_verb", "collocation", "idiom", "sentence_pattern", "other"],
          description: "Expression type"
        },
        meaning_zh: {
          type: "string",
          description: "Chinese translation of the general meaning"
        },
        local_meaning: {
          type: "string",
          description: "English definition specific to this context (NOT Chinese)"
        },
        sentence_translation: {
          type: "string",
          description: "Chinese translation of the example sentence"
        },
        syntax_hint: {
          type: "string",
          description: "Grammatical or usage notes, or null if not applicable"
        },
        difficulty: {
          type: "string",
          enum: ["A2", "B1", "B2", "C1", "C2"],
          description: "CEFR difficulty level"
        },
        value_score: {
          type: "number",
          minimum: 1,
          maximum: 10,
          description: "Learning value score (1-10)"
        }
      },
      required: [
        "expression",
        "normalized_form",
        "type",
        "meaning_zh",
        "local_meaning",
        "sentence_translation",
        "difficulty",
        "value_score"
      ]
    }
  }
};

export function buildGenerationPrompt(segmentText: string): string {
  return [
    "Analyze this English reading segment for an adult Chinese-speaking English learner.",
    "Identify phrasal verbs, collocations, idioms, sentence patterns, and useful multi-word expressions.",
    "",
    "GENERATION REQUIREMENTS:",
    "- Minimum 15 'selected' candidates, ideally 18-20",
    "- Focus on: phrasal verbs (make up, take on), collocations (take advantage of, make sense), idioms, and useful verb+preposition combinations",
    "- Include expressions at B1-C2 levels (skip basic A2 unless particularly useful)",
    "- Add 3-5 'backup_candidate' for borderline expressions",
    "- Mark common words as 'ignored_too_easy'",
    "",
    "For each candidate:",
    "- type: phrasal_verb, collocation, idiom, sentence_pattern, or other",
    "- meaning_zh: Chinese translation",
    "- local_meaning: English definition in this context (NOT Chinese)",
    "- difficulty: CEFR level (A2, B1, B2, C1, C2)",
    "- value_score: 1-10 (prioritize reusable expressions)",
    "- candidate_status: 'selected' (top priority), 'backup_candidate' (alternatives), 'ignored_too_easy' (too basic), 'ignored_duplicate' (repeats), 'ignored_over_limit' (exceeds quota)",
    "",
    "Segment:",
    segmentText,
  ].join("\n");
}

export function buildManualSelectionPrompt(selectedText: string, sentence: string, context: string): string {
  return [
    "A Chinese-speaking English learner selected this expression from their reading:",
    `Selected: "${selectedText}"`,
    "",
    "Create a learning card with:",
    "- expression: the exact selected text",
    "- normalized_form: canonical form (e.g., 'pick up' for 'picked up', lowercase)",
    "- type: phrasal_verb, collocation, idiom, sentence_pattern, or other",
    "- meaning_zh: Chinese translation of the general meaning",
    "- local_meaning: English definition specific to THIS context (NOT Chinese)",
    "- sentence_translation: Chinese translation of the sentence below",
    "- syntax_hint: grammatical or usage notes (or null)",
    "- difficulty: CEFR level (A2, B1, B2, C1, C2)",
    "- value_score: 1-10 learning value",
    "",
    "Sentence containing the expression:",
    sentence,
    "",
    "Context:",
    context,
  ].join("\n");
}

export function createOpenAiCompatibleProvider(options: OpenAiCompatibleProviderOptions): AiProvider {
  // Build LLM client config from provider options
  const llmConfig: LLMClientConfig = {
    baseUrl: options.baseUrl,
    apiKey: options.apiKey,
    model: options.model,
    provider: "openai_compatible",
  };

  return {
    async generateSegment(segment) {
      const inputLength = segment.text.length;
      console.log(`[LLM] Input text length: ${inputLength} chars`);
      console.log(`[LLM] Using tool calling with: ${CREATE_CANDIDATES_TOOL.function.name}`);
      
      const result = await callLLM(llmConfig, {
        messages: [{ role: "user", content: buildGenerationPrompt(segment.text) }],
        tools: [CREATE_CANDIDATES_TOOL],
        toolChoice: { type: "function", function: { name: CREATE_CANDIDATES_TOOL.function.name } }
      });

      // Check if tool_calls exists
      if (!result.toolCalls || result.toolCalls.length === 0) {
        console.error(`[LLM] No tool_calls in response. Model: ${llmConfig.model}, Provider: ${llmConfig.provider}`);
        console.error(`[LLM] finish_reason: ${result.finishReason || 'unknown'}`);
        console.error(`[LLM] message.content preview: ${result.content.substring(0, 500)}`);
        throw new Error(`Model did not call tool. Expected tool_calls but got none. This may indicate the model or provider does not support tool calling.`);
      }

      const toolCall = result.toolCalls[0];
      if (!toolCall) {
        throw new Error('toolCall is undefined');
      }
      
      console.log(`[LLM] Tool called: ${toolCall.function.name}`);

      // Parse tool arguments
      let toolArgs: { candidates?: any[] };
      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error(`[LLM] Failed to parse tool arguments:`, parseError);
        console.error(`[LLM] arguments (first 500 chars): ${toolCall.function.arguments.substring(0, 500)}`);
        throw new Error(`Failed to parse tool call arguments as JSON: ${parseError}`);
      }

      // Check if candidates field exists and is an array
      if (!toolArgs.candidates) {
        console.warn(`[LLM] No 'candidates' field in tool arguments. Keys: ${Object.keys(toolArgs).join(', ')}`);
        return { candidates: [] };
      }

      // Handle case where LLM returns candidates as a JSON string instead of array
      if (!Array.isArray(toolArgs.candidates)) {
        if (typeof toolArgs.candidates === 'string') {
          console.warn(`[LLM] 'candidates' is a string, attempting to parse as JSON...`);
          console.warn(`[LLM] Full candidates string length: ${toolArgs.candidates.length} chars`);
          console.warn(`[LLM] First 500 chars: ${toolArgs.candidates.substring(0, 500)}`);
          console.warn(`[LLM] Last 500 chars: ${toolArgs.candidates.substring(Math.max(0, toolArgs.candidates.length - 500))}`);
          try {
            toolArgs.candidates = JSON.parse(toolArgs.candidates);
            console.log(`[LLM] Successfully parsed candidates string into array (length: ${toolArgs.candidates.length})`);
          } catch (parseError) {
            console.error(`[LLM] Failed to parse candidates string as JSON:`, parseError);
            console.error(`[LLM] Error position: ${(parseError as any).message}`);
            // 打印出错位置附近的内容
            const errorPos = parseInt((parseError as any).message.match(/position (\d+)/)?.[1] || '0');
            if (errorPos > 0) {
              const contextStart = Math.max(0, errorPos - 200);
              const contextEnd = Math.min(toolArgs.candidates.length, errorPos + 200);
              console.error(`[LLM] Context around error (position ${errorPos}):`);
              console.error(toolArgs.candidates.substring(contextStart, contextEnd));
            }
            throw new Error(`Expected 'candidates' to be an array, got string that failed JSON parsing: ${(parseError as any).message}`);
          }
        } else {
          console.error(`[LLM] 'candidates' field is not an array. Type: ${typeof toolArgs.candidates}`);
          throw new Error(`Expected 'candidates' to be an array, got ${typeof toolArgs.candidates}`);
        }
      }

      const rawCandidatesLength = toolArgs.candidates.length;
      console.log(`[LLM] Raw candidates.length: ${rawCandidatesLength}`);

      // Hard limit: refuse to process if raw candidates > 100
      if (rawCandidatesLength > 100) {
        console.error(`[LLM] HARD LIMIT EXCEEDED: raw candidates.length = ${rawCandidatesLength} > 100. Refusing to process.`);
        throw new Error(`LLM returned ${rawCandidatesLength} candidates, exceeding hard limit of 100. This likely indicates a prompt or parsing error.`);
      }
      
      // Hard limit at 50 for database safety
      if (rawCandidatesLength > 50) {
        console.error(`[LLM] DATABASE SAFETY LIMIT: raw candidates.length = ${rawCandidatesLength} > 50. Refusing to process.`);
        throw new Error(`LLM returned ${rawCandidatesLength} candidates, exceeding database safety limit of 50.`);
      }
      
      // Helper: normalize type to valid ExpressionType
      function normalizeType(type: string): 'phrasal_verb' | 'collocation' | 'idiom' | 'sentence_pattern' | 'other' {
        const normalized = (type || '').toLowerCase().trim();
        if (['phrasal_verb', 'phrasal verb', 'phrasal-verb'].includes(normalized)) return 'phrasal_verb';
        if (['collocation'].includes(normalized)) return 'collocation';
        if (['idiom'].includes(normalized)) return 'idiom';
        if (['sentence_pattern', 'sentence pattern', 'sentence-pattern'].includes(normalized)) return 'sentence_pattern';
        return 'other'; // noun, verb, adjective, etc. all map to 'other'
      }
      
      // Helper: normalize difficulty to CEFR level
      function normalizeDifficulty(difficulty: any): 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
        if (typeof difficulty === 'string' && ['A2', 'B1', 'B2', 'C1', 'C2'].includes(difficulty)) {
          return difficulty as 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
        }
        const num = Number(difficulty);
        if (num <= 3) return 'A2';
        if (num <= 5) return 'B1';
        if (num <= 7) return 'B2';
        if (num <= 9) return 'C1';
        return 'C2';
      }
      
      // Convert snake_case to camelCase and normalize
      const candidates = (toolArgs.candidates ?? []).map((c: any) => ({
        expression: c.expression,
        normalizedForm: c.normalized_form || c.normalizedForm,
        type: normalizeType(c.type),
        meaningZh: c.meaning_zh || c.meaningZh,
        localMeaning: c.local_meaning || c.localMeaning,
        sentence: c.sentence,
        sentenceTranslation: c.sentence_translation || c.sentenceTranslation,
        syntaxHint: c.syntax_hint || c.syntaxHint,
        difficulty: normalizeDifficulty(c.difficulty),
        valueScore: c.value_score || c.valueScore,
        candidateStatus: c.candidate_status || c.candidateStatus,
        statusReason: c.status_reason || c.statusReason,
        occurrenceCount: c.occurrence_count || c.occurrenceCount,
        modelProvider: "tool_calling",
        modelName: llmConfig.model,
        promptVersion: "tool_v1",
        generationVersion: "1.0",
        generatedAt: new Date().toISOString(),
      }));

      console.log(`[LLM] Processed ${candidates.length} candidates via tool calling`);
      return { candidates };
    },
    
    async generateManualSelectionDraft(request) {
      console.log(`[LLM] Manual selection: "${request.selectedText}"`);
      
      const result = await callLLM(llmConfig, {
        messages: [{ 
          role: "user", 
          content: buildManualSelectionPrompt(request.selectedText, request.sentence, request.context) 
        }],
        tools: [CREATE_MANUAL_SELECTION_TOOL],
        toolChoice: { type: "function", function: { name: CREATE_MANUAL_SELECTION_TOOL.function.name } }
      });

      if (!result.toolCalls || result.toolCalls.length === 0) {
        console.error(`[LLM] No tool_calls in manual selection response`);
        throw new Error(`Model did not call tool for manual selection`);
      }

      const toolCall = result.toolCalls[0];
      if (!toolCall) {
        throw new Error('toolCall is undefined');
      }

      let toolArgs: any;
      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error(`[LLM] Failed to parse manual selection tool arguments:`, parseError);
        throw new Error(`Failed to parse tool arguments: ${parseError}`);
      }

      // Helper functions (reuse from generateSegment)
      function normalizeType(type: string): 'phrasal_verb' | 'collocation' | 'idiom' | 'sentence_pattern' | 'other' {
        const normalized = (type || '').toLowerCase().trim();
        if (['phrasal_verb', 'phrasal verb', 'phrasal-verb'].includes(normalized)) return 'phrasal_verb';
        if (['collocation'].includes(normalized)) return 'collocation';
        if (['idiom'].includes(normalized)) return 'idiom';
        if (['sentence_pattern', 'sentence pattern', 'sentence-pattern'].includes(normalized)) return 'sentence_pattern';
        return 'other';
      }

      function normalizeDifficulty(difficulty: any): 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
        if (typeof difficulty === 'string' && ['A2', 'B1', 'B2', 'C1', 'C2'].includes(difficulty)) {
          return difficulty as 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
        }
        const num = Number(difficulty);
        if (num <= 3) return 'A2';
        if (num <= 5) return 'B1';
        if (num <= 7) return 'B2';
        if (num <= 9) return 'C1';
        return 'C2';
      }

      const candidate = {
        id: `manual-${request.clientOperationId}`,
        userId: request.userId,
        articleId: request.articleId,
        segmentId: request.segmentId,
        expression: toolArgs.expression || request.selectedText,
        normalizedForm: toolArgs.normalized_form || toolArgs.normalizedForm || request.selectedText.toLowerCase(),
        type: normalizeType(toolArgs.type),
        meaningZh: toolArgs.meaning_zh || toolArgs.meaningZh,
        localMeaning: toolArgs.local_meaning || toolArgs.localMeaning,
        sentence: request.sentence,
        sentenceTranslation: toolArgs.sentence_translation || toolArgs.sentenceTranslation,
        syntaxHint: toolArgs.syntax_hint || toolArgs.syntaxHint || null,
        difficulty: normalizeDifficulty(toolArgs.difficulty),
        valueScore: toolArgs.value_score || toolArgs.valueScore || 7,
        candidateStatus: 'backup_candidate' as const,
        statusReason: 'Generated from manual selection',
        occurrenceCount: 1,
        modelProvider: 'tool_calling',
        modelName: llmConfig.model,
        promptVersion: 'manual_selection_v1',
        generationVersion: '1.0',
        generatedAt: new Date().toISOString(),
      };

      console.log(`[LLM] Manual selection draft created for "${candidate.expression}"`);
      
      return {
        candidate,
        duplicateExpressionSenseId: null,
        recommendation: 'add' as const,
        recommendationReason: 'New expression from manual selection',
      };
    },
    
    async generateContextEntryDraft(request) {
      console.log(`[LLM] Context generation: "${request.expression}" in ${request.contextLabel} context`);
      
      // ponytail: context→type mapping rules before LLM fallback
      const contextLower = request.contextLabel.toLowerCase();
      const typeHint = 
        contextLower.match(/game|gaming|video.?game|mmo|rpg/) ? 'slang or technical jargon (type: other)' :
        contextLower.match(/program|code|coding|tech|software|dev/) ? 'technical term (type: other)' :
        contextLower.match(/work|email|business|meeting/) ? 'collocation or phrasal_verb' :
        contextLower.match(/conversation|chat|daily|spoken/) ? 'idiom, phrasal_verb, or collocation' :
        'choose the most appropriate type';
      
      const prompt = [
        `A learner encountered this expression: "${request.expression}"`,
        `Context: ${request.contextLabel}`,
        request.contextNote ? `Additional note: ${request.contextNote}` : '',
        request.sentence ? `Original sentence: "${request.sentence}"` : '',
        '',
        'Generate a learning card with:',
        `- type: phrasal_verb, collocation, idiom, or other. Context hint: ${typeHint}`,
        '- meaning_zh: Chinese translation',
        '- local_meaning: English definition in this context',
        '- sentence: example sentence using this expression',
        '- sentence_translation: Chinese translation of the sentence',
        '- syntax_hint: usage notes (optional)',
        '- difficulty: CEFR level (B1, B2, C1, C2)',
        '- value_score: 1-10',
      ].filter(Boolean).join('\n');

      const result = await callLLM(llmConfig, {
        messages: [{ role: 'user', content: prompt }],
        tools: [{
          type: 'function' as const,
          function: {
            name: 'create_context_card',
            description: 'Create a vocabulary card from learner context',
            parameters: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['phrasal_verb', 'collocation', 'idiom', 'other'] },
                meaning_zh: { type: 'string' },
                local_meaning: { type: 'string' },
                sentence: { type: 'string' },
                sentence_translation: { type: 'string' },
                syntax_hint: { type: 'string' },
                difficulty: { type: 'string', enum: ['B1', 'B2', 'C1', 'C2'] },
                value_score: { type: 'number' },
              },
              required: ['type', 'meaning_zh', 'local_meaning', 'sentence', 'sentence_translation', 'difficulty', 'value_score'],
            },
          },
        }],
        toolChoice: { type: 'function', function: { name: 'create_context_card' } },
      });

      if (!result.toolCalls || result.toolCalls.length === 0) {
        throw new Error('Model did not call tool for context card generation');
      }

      const args = JSON.parse(result.toolCalls[0]!.function.arguments);
      const now = new Date().toISOString();

      return {
        candidate: {
          expression: request.expression,
          normalizedForm: request.expression.toLowerCase().trim(),
          type: args.type || 'other',
          meaningZh: args.meaning_zh || '',
          localMeaning: args.local_meaning || '',
          sentence: args.sentence || '',
          sentenceTranslation: args.sentence_translation || '',
          syntaxHint: args.syntax_hint || null,
          difficulty: args.difficulty || 'B1',
          valueScore: args.value_score || 5,
          candidateStatus: 'selected',
          statusReason: `Generated from ${request.contextLabel} context`,
          occurrenceCount: 1,
          modelProvider: llmConfig.provider,
          modelName: llmConfig.model,
          promptVersion: 'context-v1',
          generationVersion: 'context-v1',
          generatedAt: now,
        },
        generatedAt: now,
      };
    },
  };
}
