import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Plan } from "../src/state/types";

// Mock the LLM wrapper directly
vi.mock("../src/llm/anthropic", () => ({
  createAnthropicClient: vi.fn(),
}));

describe("plannerAgent", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should parse a valid plan from LLM response", async () => {
    const mockPlan: Plan = {
      goal: "Build a todo app",
      tasks: [
        {
          id: "task-1",
          title: "Create Todo model",
          deps: [],
          acceptanceCriteria: ["Define Todo interface with id, title, done fields"],
          files: ["src/models/todo.ts"],
          status: "pending",
        },
        {
          id: "task-2",
          title: "Create Todo list component",
          deps: ["task-1"],
          acceptanceCriteria: ["Render list of todos", "Support toggle done"],
          files: ["src/components/TodoList.tsx"],
          status: "pending",
        },
      ],
    };

    const { createAnthropicClient } = await import("../src/llm/anthropic");
    vi.mocked(createAnthropicClient).mockReturnValue({
      invoke: vi.fn().mockResolvedValue({
        content: JSON.stringify(mockPlan),
      }),
    } as never);

    const { plannerAgent } = await import("../src/agents/planner");
    const result = await plannerAgent({ goal: "Build a todo app" });

    expect(result.goal).toBe("Build a todo app");
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks[0]!.id).toBe("task-1");
    expect(result.tasks[1]!.deps).toContain("task-1");
  });
});
