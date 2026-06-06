import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAnthropicClient } from "../llm/anthropic";
import { SYSTEM_PROMPT } from "../prompts/system";
import { CRITIC_PROMPT } from "../prompts/critic";
import type { Task, PatchSet, CritiqueResult } from "../state/types";
import { CritiqueResultSchema } from "../state/types";

/**
 * Critic agent: reviews coder output vs acceptance criteria,
 * returns pass/fail with issues and suggestions.
 */
export async function criticAgent(input: {
  task: Task;
  patches: PatchSet;
}): Promise<CritiqueResult> {
  const llm = createAnthropicClient({ streaming: false });

  const patchSummary = input.patches.patches
    .map((p) => `${p.action} ${p.path}`)
    .join("\n");

  const patchContent = input.patches.patches
    .filter((p) => p.content)
    .map((p) => `--- ${p.path} ---\n${p.content}`)
    .join("\n\n");

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT + "\n\n" + CRITIC_PROMPT),
    new HumanMessage(
      `Task: ${input.task.title}\nAcceptance Criteria:\n${input.task.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}\n\nPatch Summary:\n${patchSummary}\n\nPatch Content:\n${patchContent}\n\nReview the code and return your critique as JSON.`
    ),
  ]);

  const text =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const parsed = JSON.parse(text);
  return CritiqueResultSchema.parse(parsed);
}
