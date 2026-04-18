import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAnthropicClient } from "../llm/anthropic";
import { SYSTEM_PROMPT } from "../prompts/system";
import { CODER_PROMPT } from "../prompts/coder";
import type { Task, PatchSet } from "../state/types";
import { PatchSetSchema } from "../state/types";

/**
 * Coder agent: takes a single task, returns a structured patch set
 * (array of file changes: create, modify, or delete).
 */
export async function coderAgent(input: {
  task: Task;
  existingCode?: string;
}): Promise<PatchSet> {
  const llm = createAnthropicClient({ streaming: false });

  const codeSection = input.existingCode
    ? `\n\nExisting code context:\n${input.existingCode}`
    : "";

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT + "\n\n" + CODER_PROMPT),
    new HumanMessage(
      `Task ID: ${input.task.id}\nTitle: ${input.task.title}\nAcceptance Criteria:\n${input.task.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}\nFiles: ${input.task.files.join(", ")}${codeSection}\n\nGenerate the patch set as JSON.`
    ),
  ]);

  const text =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const parsed = JSON.parse(text);
  return PatchSetSchema.parse(parsed);
}
