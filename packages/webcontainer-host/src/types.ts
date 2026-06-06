/**
 * @nexus/webcontainer-host — shared types & zod schemas
 *
 * Defines the data contracts used by the WebContainer Builder:
 * file trees, process handles, and preview/hot-reload state.
 */

import { z } from "zod";

/** A single file mounted into the WebContainer file system. */
export const WebContainerFileSchema = z.object({
  path: z.string().min(1),
  contents: z.string(),
});
export type WebContainerFile = z.infer<typeof WebContainerFileSchema>;

/** A flat representation of a project file tree. */
export const FileTreeSchema = z.array(WebContainerFileSchema);
export type FileTree = z.infer<typeof FileTreeSchema>;

/** Kinds of long-running processes the host can spawn. */
export const ProcessKindSchema = z.enum(["install", "dev", "build", "test"]);
export type ProcessKind = z.infer<typeof ProcessKindSchema>;

/** Handle returned when a process is spawned inside the container. */
export const ProcessHandleSchema = z.object({
  id: z.string(),
  kind: ProcessKindSchema,
  command: z.string(),
  args: z.array(z.string()).default([]),
  startedAt: z.number(),
});
export type ProcessHandle = z.infer<typeof ProcessHandleSchema>;

/** Lifecycle of the live preview / hot-reload bridge. */
export const PreviewStatusSchema = z.enum([
  "idle",
  "booting",
  "installing",
  "starting",
  "ready",
  "error",
]);
export type PreviewStatus = z.infer<typeof PreviewStatusSchema>;

/** Current state of the live preview surface. */
export const PreviewStateSchema = z.object({
  status: PreviewStatusSchema,
  url: z.string().url().optional(),
  port: z.number().int().positive().optional(),
  error: z.string().optional(),
});
export type PreviewState = z.infer<typeof PreviewStateSchema>;

/** Streamed events emitted by a builder session. */
export const BuilderEventTypeSchema = z.enum([
  "boot",
  "mount",
  "process_start",
  "process_output",
  "process_exit",
  "preview",
  "error",
]);
export type BuilderEventType = z.infer<typeof BuilderEventTypeSchema>;

export const BuilderEventSchema = z.object({
  type: BuilderEventTypeSchema,
  data: z.record(z.string(), z.unknown()).default({}),
  timestamp: z.number(),
});
export type BuilderEvent = z.infer<typeof BuilderEventSchema>;
