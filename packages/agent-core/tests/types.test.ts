import { describe, it, expect } from "vitest";
import {
  PlanSchema,
  TaskSchema,
  PatchSchema,
  PatchSetSchema,
  CritiqueResultSchema,
  TestResultSchema,
  MemoryRecordSchema,
  AgentStateSchema,
} from "../src/state/types";

describe("State type schemas", () => {
  describe("TaskSchema", () => {
    it("should validate a valid task", () => {
      const task = TaskSchema.parse({
        id: "task-1",
        title: "Create component",
        deps: [],
        acceptanceCriteria: ["Renders correctly"],
        files: ["src/Component.tsx"],
      });
      expect(task.id).toBe("task-1");
      expect(task.status).toBe("pending"); // default
    });

    it("should reject task without required fields", () => {
      expect(() => TaskSchema.parse({ id: "task-1" })).toThrow();
    });
  });

  describe("PlanSchema", () => {
    it("should validate a valid plan", () => {
      const plan = PlanSchema.parse({
        goal: "Build app",
        tasks: [
          {
            id: "task-1",
            title: "Setup",
            deps: [],
            acceptanceCriteria: ["Project initialised"],
            files: ["package.json"],
          },
        ],
      });
      expect(plan.goal).toBe("Build app");
      expect(plan.tasks).toHaveLength(1);
    });
  });

  describe("PatchSchema", () => {
    it("should validate create patch with content", () => {
      const patch = PatchSchema.parse({
        path: "src/index.ts",
        action: "create",
        content: "export default {};",
      });
      expect(patch.action).toBe("create");
    });

    it("should validate delete patch without content", () => {
      const patch = PatchSchema.parse({
        path: "src/old.ts",
        action: "delete",
      });
      expect(patch.content).toBeUndefined();
    });
  });

  describe("PatchSetSchema", () => {
    it("should validate a patch set", () => {
      const patchSet = PatchSetSchema.parse({
        taskId: "task-1",
        patches: [{ path: "a.ts", action: "create", content: "// code" }],
      });
      expect(patchSet.taskId).toBe("task-1");
    });
  });

  describe("CritiqueResultSchema", () => {
    it("should validate a passing critique", () => {
      const critique = CritiqueResultSchema.parse({
        pass: true,
        issues: [],
        suggestions: [],
      });
      expect(critique.pass).toBe(true);
    });

    it("should validate a failing critique with issues", () => {
      const critique = CritiqueResultSchema.parse({
        pass: false,
        issues: ["Missing type"],
        suggestions: ["Add types"],
      });
      expect(critique.pass).toBe(false);
      expect(critique.issues).toHaveLength(1);
    });
  });

  describe("TestResultSchema", () => {
    it("should validate test result", () => {
      const result = TestResultSchema.parse({
        pass: true,
        logs: ["All tests passed"],
      });
      expect(result.pass).toBe(true);
    });
  });

  describe("MemoryRecordSchema", () => {
    it("should validate memory record", () => {
      const record = MemoryRecordSchema.parse({
        task: "Build todo app",
        approach: "Component-first",
        outcome: "Success",
        lessons: "Start with types",
      });
      expect(record.task).toBe("Build todo app");
    });
  });

  describe("AgentStateSchema", () => {
    it("should validate a minimal agent state", () => {
      const state = AgentStateSchema.parse({
        goal: "Build app",
        projectId: "project-1",
      });
      expect(state.status).toBe("planning");
      expect(state.retryCount).toBe(0);
      expect(state.maxRetries).toBe(3);
      expect(state.patches).toEqual([]);
    });
  });
});
