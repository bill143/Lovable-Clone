import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAnthropicClient } from "../llm/anthropic";
import { SYSTEM_PROMPT } from "../prompts/system";
import { PLANNER_PROMPT } from "../prompts/planner";
import type { Plan } from "../state/types";
import { PlanSchema } from "../state/types";

/**
 * Planner agent: takes a user goal + optional repo context,
 * returns a structured JSON plan with tasks.
 */
export async function plannerAgent(input: {
  goal: string;
  repoContext?: string;
}): Promise<Plan> {
  const llm = createAnthropicClient({ streaming: false });

  const contextSection = input.repoContext
    ? `\n\nRepository context:\n${input.repoContext}`
    : "";

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT + "\n\n" + PLANNER_PROMPT),
    new HumanMessage(
      `Goal: ${input.goal}${contextSection}\n\nGenerate the task plan as JSON.`
    ),
  ]);

  const text =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const parsed = JSON.parse(text);
  return PlanSchema.parse(parsed);
}
