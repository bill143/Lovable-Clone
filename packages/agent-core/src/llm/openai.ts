import { ChatOpenAI } from "@langchain/openai";

const DEFAULT_OPENAI_MODEL = "gpt-4o";

/**
 * Create an OpenAI GPT-4o client stub for future vision diffing.
 * This is a thin wrapper — no heavy logic yet, just the client setup.
 */
export function createOpenAIClient(options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): ChatOpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY environment variable. Set it in .env.local."
    );
  }

  return new ChatOpenAI({
    openAIApiKey: apiKey,
    model: options?.model ?? DEFAULT_OPENAI_MODEL,
    temperature: options?.temperature ?? 0.2,
    maxTokens: options?.maxTokens ?? 4096,
  });
}

export { DEFAULT_OPENAI_MODEL };
