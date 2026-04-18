import { ChatAnthropic } from "@langchain/anthropic";
import { SYSTEM_PROMPT } from "../prompts/system";

const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";
const FALLBACK_MODEL = "claude-sonnet-4-5-latest";

/**
 * Create an Anthropic Claude client for the NEXUS agent system.
 * Uses Claude Sonnet 4.5 with streaming and function-calling support.
 */
export function createAnthropicClient(options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}): ChatAnthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY environment variable. Set it in .env.local."
    );
  }

  const model =
    options?.model ??
    process.env.NEXUS_MODEL ??
    DEFAULT_MODEL;

  return new ChatAnthropic({
    anthropicApiKey: apiKey,
    model,
    temperature: options?.temperature ?? 0.2,
    maxTokens: options?.maxTokens ?? 4096,
    streaming: options?.streaming ?? true,
  });
}

/**
 * Wrap a user message with the NEXUS system prompt.
 */
export function withSystemPrompt(userMessage: string): Array<{ role: string; content: string }> {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];
}

export { DEFAULT_MODEL, FALLBACK_MODEL };
