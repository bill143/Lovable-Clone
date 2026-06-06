/**
 * @nexus/agent-core — LangGraph multi-agent system with Anthropic Claude integration
 *
 * Public API: `runAgent({goal, projectId, onEvent})` returning an async iterator of stream events.
 */

import { buildAgentGraph } from "./graph";
import type { AgentState, StreamEvent } from "./state/types";

// Re-export types
export type {
  AgentState,
  Plan,
  Task,
  Patch,
  PatchSet,
  CritiqueResult,
  TestResult,
  MemoryRecord,
  StreamEvent,
  StreamEventType,
} from "./state/types";

export {
  AgentStateSchema,
  PlanSchema,
  TaskSchema,
  PatchSchema,
  PatchSetSchema,
  CritiqueResultSchema,
  TestResultSchema,
  MemoryRecordSchema,
} from "./state/types";

// Re-export agents for direct use
export { plannerAgent } from "./agents/planner";
export { coderAgent } from "./agents/coder";
export { criticAgent } from "./agents/critic";
export { testerAgent } from "./agents/tester";
export { reflectorAgent } from "./agents/reflector";

// Re-export LLM clients
export { createAnthropicClient } from "./llm/anthropic";
export { createOpenAIClient } from "./llm/openai";

// Re-export memory
export { remember, recall, generateEmbedding } from "./memory/pgvector";

// Re-export prompts
export {
  SYSTEM_PROMPT,
  PLANNER_PROMPT,
  CODER_PROMPT,
  CRITIC_PROMPT,
  TESTER_PROMPT,
  REFLECTOR_PROMPT,
} from "./prompts";

// Re-export graph
export { buildAgentGraph } from "./graph";

/**
 * Run the full NEXUS agent pipeline for a given goal.
 *
 * Returns an async iterator of StreamEvent objects.
 * Events include: plan, task_start, task_patch, task_critique,
 * task_test, task_reflect, task_done, error, done.
 */
export async function* runAgent(input: {
  goal: string;
  projectId: string;
  maxRetries?: number;
  onEvent?: (event: StreamEvent) => void;
}): AsyncGenerator<StreamEvent> {
  const events: StreamEvent[] = [];
  const maxRetries = input.maxRetries ?? parseInt(process.env.NEXUS_MAX_RETRIES ?? "3", 10);

  const onEvent = (event: StreamEvent) => {
    events.push(event);
    input.onEvent?.(event);
  };

  const graph = buildAgentGraph(onEvent);

  const initialState: AgentState = {
    goal: input.goal,
    projectId: input.projectId,
    plan: undefined,
    currentTaskIndex: 0,
    patches: [],
    critique: undefined,
    testResult: undefined,
    memoryRecord: undefined,
    retryCount: 0,
    maxRetries,
    status: "planning",
    error: undefined,
  };

  try {
    await graph.invoke(initialState);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const errorEvent: StreamEvent = {
      type: "error",
      data: { message: msg },
      timestamp: Date.now(),
    };
    events.push(errorEvent);
  }

  // Yield all collected events
  for (const event of events) {
    yield event;
  }
}
