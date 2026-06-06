/**
 * @nexus/webcontainer-host — process spawning
 *
 * Spawns long-running processes (install, dev server, build, test) inside
 * the WebContainer and streams their stdout/stderr back to the caller.
 */

import type { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { nanoid } from "nanoid";
import type { BuilderEvent, ProcessHandle, ProcessKind } from "./types";

export interface SpawnOptions {
  kind: ProcessKind;
  command: string;
  args?: string[];
  onEvent?: (event: BuilderEvent) => void;
}

export interface SpawnResult {
  handle: ProcessHandle;
  process: WebContainerProcess;
  /** Resolves with the process exit code. */
  exit: Promise<number>;
}

/**
 * Spawn a process inside the container and stream its output as
 * `process_output` builder events. Resolves immediately with a handle;
 * await `result.exit` for the final exit code.
 */
export async function spawnProcess(
  container: WebContainer,
  options: SpawnOptions,
): Promise<SpawnResult> {
  const { kind, command, args = [], onEvent } = options;

  const handle: ProcessHandle = {
    id: nanoid(),
    kind,
    command,
    args,
    startedAt: Date.now(),
  };

  const emit = (type: BuilderEvent["type"], data: Record<string, unknown>) =>
    onEvent?.({ type, data, timestamp: Date.now() });

  emit("process_start", { id: handle.id, kind, command, args });

  const process = await container.spawn(command, args);

  // Stream output chunks as events.
  void process.output.pipeTo(
    new WritableStream<string>({
      write(chunk) {
        emit("process_output", { id: handle.id, chunk });
      },
    }),
  );

  const exit = process.exit.then((code) => {
    emit("process_exit", { id: handle.id, code });
    return code;
  });

  return { handle, process, exit };
}

/** Convenience: run a process to completion and return its exit code. */
export async function runToCompletion(
  container: WebContainer,
  options: SpawnOptions,
): Promise<number> {
  const { exit } = await spawnProcess(container, options);
  return exit;
}
