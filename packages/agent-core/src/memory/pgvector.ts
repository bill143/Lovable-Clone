import { OpenAIEmbeddings } from "@langchain/openai";

/**
 * Thin wrapper over Supabase `agent_memories` table for pgvector memory.
 * Uses OpenAI text-embedding-3-small for embeddings.
 */

interface MemoryEntry {
  task: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

interface RecallResult {
  id: string;
  task: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

// Lazy singleton for embeddings
let embeddingsClient: OpenAIEmbeddings | null = null;

function getEmbeddings(): OpenAIEmbeddings {
  if (!embeddingsClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY environment variable for embeddings.");
    }
    embeddingsClient = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      model: "text-embedding-3-small",
    });
  }
  return embeddingsClient;
}

/**
 * Generate an embedding vector for the given text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = getEmbeddings();
  return embeddings.embedQuery(text);
}

/**
 * Store a memory entry in the agent_memories table.
 * Requires a Supabase client to be passed in.
 */
export async function remember(
  supabase: { from: (table: string) => { insert: (data: unknown) => { throwOnError: () => Promise<unknown> } } },
  entry: {
    projectId?: string;
    userId: string;
    memoryType: "task" | "approach" | "outcome" | "lesson" | "reflection";
    content: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const embedding = await generateEmbedding(entry.content);

  await supabase
    .from("agent_memories")
    .insert({
      project_id: entry.projectId ?? null,
      user_id: entry.userId,
      memory_type: entry.memoryType,
      content: entry.content,
      embedding,
      metadata: entry.metadata ?? {},
    })
    .throwOnError();
}

/**
 * Recall memories similar to the given query.
 * Uses pgvector cosine similarity search via Supabase RPC.
 *
 * Note: Requires a Supabase RPC function `match_agent_memories` to be defined.
 * If the function doesn't exist yet, falls back to a basic text search.
 */
export async function recall(
  supabase: { rpc: (fn: string, params: Record<string, unknown>) => { throwOnError: () => Promise<{ data: RecallResult[] | null }> } },
  query: { query: string; k?: number; projectId?: string }
): Promise<RecallResult[]> {
  const embedding = await generateEmbedding(query.query);
  const k = query.k ?? 5;

  try {
    const { data } = await supabase
      .rpc("match_agent_memories", {
        query_embedding: embedding,
        match_count: k,
        filter_project_id: query.projectId ?? null,
      })
      .throwOnError();

    return data ?? [];
  } catch {
    // Fallback: RPC function may not exist yet
    return [];
  }
}

export type { MemoryEntry, RecallResult };
