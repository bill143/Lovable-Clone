import { describe, it, expect } from "vitest";
import { testerAgent } from "../src/agents/tester";
import type { PatchSet } from "../src/state/types";

describe("testerAgent", () => {
  it("should pass for valid patches with content", async () => {
    const patches: PatchSet = {
      taskId: "task-1",
      patches: [
        {
          path: "src/models/todo.ts",
          action: "create",
          content: "export interface Todo { id: string; title: string; }",
        },
      ],
    };

    const result = await testerAgent({ patches });

    expect(result.pass).toBe(true);
    expect(result.logs).toContain("[OK] src/models/todo.ts: create — content present");
    expect(result.logs).toContain("[DRY-RUN] Tester completed — real execution deferred to PR #5");
  });

  it("should fail for patches missing content", async () => {
    const patches: PatchSet = {
      taskId: "task-1",
      patches: [
        {
          path: "src/models/todo.ts",
          action: "create",
        },
      ],
    };

    const result = await testerAgent({ patches });

    expect(result.pass).toBe(false);
    expect(result.logs).toContain("[FAIL] src/models/todo.ts: missing content for create action");
  });

  it("should handle delete actions without requiring content", async () => {
    const patches: PatchSet = {
      taskId: "task-1",
      patches: [
        {
          path: "src/old-file.ts",
          action: "delete",
        },
      ],
    };

    const result = await testerAgent({ patches });

    expect(result.pass).toBe(true);
    expect(result.logs).toContain("[OK] src/old-file.ts: delete action — no content needed");
  });

  it("should warn when no patches are provided", async () => {
    const patches: PatchSet = {
      taskId: "task-1",
      patches: [],
    };

    const result = await testerAgent({ patches });

    expect(result.pass).toBe(true);
    expect(result.logs).toContain("[WARN] No patches provided");
  });

  it("should warn about require() usage in TypeScript files", async () => {
    const patches: PatchSet = {
      taskId: "task-1",
      patches: [
        {
          path: "src/config.ts",
          action: "create",
          content: 'const fs = require("fs");\nconsole.log(fs);',
        },
      ],
    };

    const result = await testerAgent({ patches });

    expect(result.pass).toBe(true);
    expect(result.logs).toContain("[WARN] src/config.ts: uses require() instead of ES imports");
  });
});
