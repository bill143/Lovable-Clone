import { z } from "zod";

// ─── Task ────────────────────────────────────────────────────────────────────
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  deps: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()),
  files: z.array(z.string()),
  status: z
    .enum(["pending", "running", "passed", "failed"])
    .default("pending"),
});
export type Task = z.infer<typeof TaskSchema>;

// ─── Plan ────────────────────────────────────────────────────────────────────
export const PlanSchema = z.object({
  goal: z.string(),
  tasks: z.array(TaskSchema),
});
export type Plan = z.infer<typeof PlanSchema>;

// ─── Patch ───────────────────────────────────────────────────────────────────
export const PatchSchema = z.object({
  path: z.string(),
  action: z.enum(["create", "modify", "delete"]),
  content: z.string().optional(),
  diff: z.string().optional(),
});
export type Patch = z.infer<typeof PatchSchema>;

export const PatchSetSchema = z.object({
  taskId: z.string(),
  patches: z.array(PatchSchema),
});
export type PatchSet = z.infer<typeof PatchSetSchema>;

// ─── Critique ────────────────────────────────────────────────────────────────
export const CritiqueResultSchema = z.object({
  pass: z.boolean(),
  issues: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
});
export type CritiqueResult = z.infer<typeof CritiqueResultSchema>;

// ─── Test ────────────────────────────────────────────────────────────────────
export const TestResultSchema = z.object({
  pass: z.boolean(),
  logs: z.array(z.string()).default([]),
});
export type TestResult = z.infer<typeof TestResultSchema>;

// ─── Memory ──────────────────────────────────────────────────────────────────
export const MemoryRecordSchema = z.object({
  task: z.string(),
  approach: z.string(),
  outcome: z.string(),
  lessons: z.string(),
});
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;

// ─── Agent State (LangGraph node shared state) ──────────────────────────────
export const AgentStateSchema = z.object({
  goal: z.string(),
  projectId: z.string(),
  plan: PlanSchema.optional(),
  currentTaskIndex: z.number().default(0),
  patches: z.array(PatchSetSchema).default([]),
  critique: CritiqueResultSchema.optional(),
  testResult: TestResultSchema.optional(),
  memoryRecord: MemoryRecordSchema.optional(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  status: z
    .enum(["planning", "coding", "critiquing", "testing", "reflecting", "done", "error"])
    .default("planning"),
  error: z.string().optional(),
});
export type AgentState = z.infer<typeof AgentStateSchema>;

// ─── Stream events ──────────────────────────────────────────────────────────
export type StreamEventType =
  | "plan"
  | "task_start"
  | "task_patch"
  | "task_critique"
  | "task_test"
  | "task_reflect"
  | "task_done"
  | "error"
  | "done";

export interface StreamEvent {
  type: StreamEventType;
  data: unknown;
  timestamp: number;
}
