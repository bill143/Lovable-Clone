import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAnthropicClient } from "../llm/anthropic";
import { SYSTEM_PROMPT } from "../prompts/system";
import { REFLECTOR_PROMPT } from "../prompts/reflector";
import type { Task, CritiqueResult, MemoryRecord } from "../state/types";
import { MemoryRecordSchema } from "../state/types";

/**
 * Reflector agent: writes a retrospective record for pgvector memory.
 * Records task, approach, outcome, and lessons learned.
 */
export async function reflectorAgent(input: {
  task: Task;
  critique?: CritiqueResult;
  success: boolean;
}): Promise<MemoryRecord> {
  const llm = createAnthropicClient({ streaming: false });

  const critiqueSection = input.critique
    ? `\nCritique: ${input.critique.pass ? "Passed" : "Failed"}\nIssues: ${input.critique.issues.join(", ") || "None"}\nSuggestions: ${input.critique.suggestions.join(", ") || "None"}`
    : "";

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT + "\n\n" + REFLECTOR_PROMPT),
    new HumanMessage(
      `Task: ${input.task.title}\nAcceptance Criteria:\n${input.task.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}\nOutcome: ${input.success ? "Success" : "Failure"}${critiqueSection}\n\nWrite the retrospective record as JSON.`
    ),
  ]);

  const text =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const parsed = JSON.parse(text);
  return MemoryRecordSchema.parse(parsed);
}
