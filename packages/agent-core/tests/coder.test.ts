import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task, PatchSet } from "../src/state/types";

vi.mock("../src/llm/anthropic", () => ({
  createAnthropicClient: vi.fn(),
}));

describe("coderAgent", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should parse a valid patch set from LLM response", async () => {
    const task: Task = {
      id: "task-1",
      title: "Create Todo model",
      deps: [],
      acceptanceCriteria: ["Define Todo interface"],
      files: ["src/models/todo.ts"],
      status: "pending",
    };

    const mockPatchSet: PatchSet = {
      taskId: "task-1",
      patches: [
        {
          path: "src/models/todo.ts",
          action: "create",
          content: "export interface Todo {\n  id: string;\n  title: string;\n  done: boolean;\n}",
        },
      ],
    };

    const { createAnthropicClient } = await import("../src/llm/anthropic");
    vi.mocked(createAnthropicClient).mockReturnValue({
      invoke: vi.fn().mockResolvedValue({
        content: JSON.stringify(mockPatchSet),
      }),
    } as never);

    const { coderAgent } = await import("../src/agents/coder");
    const result = await coderAgent({ task });

    expect(result.taskId).toBe("task-1");
    expect(result.patches).toHaveLength(1);
    expect(result.patches[0]!.action).toBe("create");
    expect(result.patches[0]!.path).toBe("src/models/todo.ts");
  });
});
