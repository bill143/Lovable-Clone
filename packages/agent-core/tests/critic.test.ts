import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task, PatchSet, CritiqueResult } from "../src/state/types";

vi.mock("../src/llm/anthropic", () => ({
  createAnthropicClient: vi.fn(),
}));

describe("criticAgent", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  it("should parse a passing critique from LLM response", async () => {
    const task: Task = {
      id: "task-1",
      title: "Create Todo model",
      deps: [],
      acceptanceCriteria: ["Define Todo interface with id, title, done"],
      files: ["src/models/todo.ts"],
      status: "pending",
    };

    const patches: PatchSet = {
      taskId: "task-1",
      patches: [
        {
          path: "src/models/todo.ts",
          action: "create",
          content: "export interface Todo { id: string; title: string; done: boolean; }",
        },
      ],
    };

    const mockCritique: CritiqueResult = {
      pass: true,
      issues: [],
      suggestions: ["Consider adding JSDoc comments"],
    };

    const { createAnthropicClient } = await import("../src/llm/anthropic");
    vi.mocked(createAnthropicClient).mockReturnValue({
      invoke: vi.fn().mockResolvedValue({
        content: JSON.stringify(mockCritique),
      }),
    } as never);

    const { criticAgent } = await import("../src/agents/critic");
    const result = await criticAgent({ task, patches });

    expect(result.pass).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.suggestions).toHaveLength(1);
  });

  it("should parse a failing critique from LLM response", async () => {
    const task: Task = {
      id: "task-1",
      title: "Create Todo model",
      deps: [],
      acceptanceCriteria: ["Define Todo interface with id, title, done, createdAt"],
      files: ["src/models/todo.ts"],
      status: "pending",
    };

    const patches: PatchSet = {
      taskId: "task-1",
      patches: [
        {
          path: "src/models/todo.ts",
          action: "create",
          content: "export interface Todo { id: string; title: string; done: boolean; }",
        },
      ],
    };

    const mockCritique: CritiqueResult = {
      pass: false,
      issues: ["Missing createdAt field in Todo interface"],
      suggestions: ["Add createdAt: Date to the interface"],
    };

    const { createAnthropicClient } = await import("../src/llm/anthropic");
    vi.mocked(createAnthropicClient).mockReturnValue({
      invoke: vi.fn().mockResolvedValue({
        content: JSON.stringify(mockCritique),
      }),
    } as never);

    const { criticAgent } = await import("../src/agents/critic");
    const result = await criticAgent({ task, patches });

    expect(result.pass).toBe(false);
    expect(result.issues).toContain("Missing createdAt field in Todo interface");
  });
});
